import { S3Client } from "jsr:@bradenmacdonald/s3-lite-client@0.9.0";


const ak = Deno.env.get("REAL_AK")
const sk = Deno.env.get("REAL_SK")

if (!ak || !sk) {
  throw new Error("Missing MINIO_ACCESS_KEY or MINIO_SECRET_KEY in environment");
}

const S3Config = {
  endPoint: "minio.hzc.pub",
  port: 443,
  useSSL: true,
  region: "cn-xiamen",
  accessKey: ak, 
  secretKey: sk,
  bucket: "electrolyte-brain",
  pathStyle: true,
};

const s3client = new S3Client(S3Config);


const accounts = [
    {account: "admin", pass: "admin-chem-brain"}
];

function accountChecker(account, pass) {
    return !!accounts.find(item => item.account === account && item.pass === pass)
}

function genRespond (body) {
    return new Response(JSON.stringify(body, null, 2), {
        headers: {
            "content-type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "Request-Context,api-supported-versions,Content-Length,Date,Server",
        },
    });
}

async function handle(req: Request): Promise<Response> {
    const url = req.url;
    const isPOST = req.method === "POST";
    if (!url) {
        return genRespond({error: "No url", reload: true});
    }
    const urlParse = new URL(url);
    if (urlParse.pathname.startsWith("/api")) {
        if (urlParse.pathname.endsWith("/presignedPutObject")) {
            const doiReg = /10\.\d+_[\w\.]+/;
            const doi = urlParse.searchParams.get("doi");
            const account = urlParse.searchParams.get("account");
            const pass = urlParse.searchParams.get("pass");
            const file_name = urlParse.searchParams.get("file_name");

            if (!accountChecker(account, pass)) {
                return genRespond({error: "Error user info!", reload: true});
            }

            let body;
            if (!(doi && file_name)) {
                body = {error: `Missing doi or file_name`, reload: true};
            } else if (doiReg.test(doi) === false) {
                body = {error: `Unexcepted doi`, reload: false};
            } else {
                const key = `${doi.replace("_", "/")}/${file_name}`;
                console.log("key:", key)
                try {
                    await s3client.getObject(key)
                    body = {error: `doi and file have existed`, reload: false};
                } catch(err) {
                    const url = await s3client.getPresignedUrl("PUT", key, {expirySeconds: 15*60})
                    body = {url, reload: false};
                }
                // const isExisted =  await s3client.getObject(key).catch(err => false);
                // if (isExisted) {
                //     body = {error: `doi and file have existed`, reload: false};
                // } else {
                //     const url = await s3client.getPresignedUrl("PUT", key, {expirySeconds: 15*60})
                //     body = {url, reload: false};
                // }
            }

            return genRespond(body);
        } else {
            return genRespond({error: "No supprot, " + url, reload: true});
        }
    } else {
        return genRespond({error: "Nothing here", reload: true});
    }
}


Deno.serve(handle);