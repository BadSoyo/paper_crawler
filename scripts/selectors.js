
window.validators = {
  "10.1002": {
    "sel_A": [
      ".article__body .abstract-group .article-section__abstract .article-section__content",
      "article .abstract-group",
      "#ContentColumn h2.abstract-title + .abstract > p:first-child"
    ],
    "sel_R": "a[data-tab=\"pane-pcw-references\"]",
    "sel_P": [
      ".article__body .article-section__full :where(.article-section__content > p, .article-section__sub-content > p)",
      "#ContentColumn :where(h2.section-title, h3.section-title, h4.section-title)~:where(p, ul)"
    ],
    "sel_F": [
      ".article__body .article-section__inline-figure .figure__caption-text"
    ],
    "sel_S": [
      ".article__body .article-section__inline-figure .figure__caption-text"
    ],
    "sel_T": [
      {
        "wrapper": ".article__body .article-table-content",
        "title": ".article-table-caption",
        "table": "table",
        "footer": ".article-section__table-footnotes"
      }
    ]
  },
  "10.3390": {
    "sel_A": ["#html-abstract .html-p"],
    "sel_R": "a.html-bibr",
    "sel_P": ["article .html-body .html-p"],
    "sel_F": ["article .html-fig-wrap .html-fig_description"],
    "sel_S": ["article .html-fig-wrap .html-fig_description"],
    "sel_T": [
      {
        "wrapper": "article .html-table-wrap",
        "title": ".html-table_wrap_discription",
        "table": "article [id^='table_body_display_molecules'] table",
        "footer": ""
      }
    ]
  },
  "10.1039": {
    "sel_A": ["article .capsule__text"],
    "sel_R": "a[href^=\"#cit\"]",
    "sel_P": ["#pnlArticleContentLoaded > p"],
    "sel_F": ["#pnlArticleContentLoaded [id^='fig'] figcaption"],
    "sel_S": ["#pnlArticleContentLoaded [id^='sch'] figcaption"],
    "sel_T": [
      {
        "wrapper": "#pnlArticleContentLoaded [id^='tab']",
        "title": "figcaption",
        "table": "table",
        "footer": "tfoot"
      }
    ]
  },
  "10.1021": {
    "sel_A": ["p.articleBody_abstractText", "#specialIssueNotice"],
    "sel_R": "a[class^=\"ref ref\"]",
    "sel_P": ["div.NLM_p", ".article_content-left > p"],
    "sel_F": ["[id^='fig'] figcaption"],
    "sel_S": ["[id^='sch']"],
    "sel_T": [
      {
        "wrapper": ".NLM_table-wrap",
        "title": ".hlFld-FigureCaption",
        "table": "table",
        "footer": ".NLM_table-wrap-foot"
      }
    ]
  },
  "10.1038": {
    "sel_A": ["#Abs1-content", "article [data-title=\"Abstract\"]"],
    "sel_R": "a[data-test=\"citation-ref\"]",
    "sel_P": ["article .main-content .c-article-section__content > p"],
    "sel_F": [
      "article .main-content figure .c-article-section__figure-caption"
    ],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": "",
        "title": "",
        "table": "",
        "footer": ""
      }
    ]
  },
  "10.1007": {
    "sel_A": ["#Abs1-content p"],
    "sel_R": "a[id^=\"ref\"]",
    "sel_P": [".main-content .c-article-section__content > p"],
    "sel_F": [".main-content figure .c-article-section__figure-description"],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": "",
        "title": "",
        "table": "",
        "footer": ""
      }
    ]
  },
  "10.1088": {
    "sel_A": [".wd-jnl-art-abstract > p"],
    "sel_R": "a[id^=\"fnref-\"]",
    "sel_P": [
      ":where( div[itemprop=\"articleBody\"] >  p, div[itemprop=\"articleBody\"] > .article-text > p, div[itemprop=\"articleBody\"] > .article-text > .article-text > p, div[itemprop=\"articleBody\"] > .article-text > .article-text > .article-text > p)"
    ],
    "sel_F": [".article-text figure figcaption .article-text"],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": "div.boxout.boxout-bdr-grey",
        "title": ":scope > p",
        "table": ":scope > table",
        "footer": ":scope > p"
      }
    ]
  },
  "10.1063": {
    "sel_A": ["#ContentTab .abstract p"],
    "sel_R": "a.link-ref.xref-bibr",
    "sel_P": ["#ContentTab .article-section-wrapper > p"],
    "sel_F": ["#ContentTab .article-section-wrapper .fig-section .fig-caption"],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": "#ContentTab .article-section-wrapper .table-wrap",
        "title": ".table-wrap-title",
        "table": ".table-overflow table",
        "footer": ""
      }
    ]
  },
  "10.1126": {
    "sel_A": ["[role=\"doc-abstract\"] > [role=\"paragraph\"]"],
    "sel_R": "a[role=\"doc-biblioref\"]",
    "sel_P": ["#bodymatter [role=\"paragraph\"]"],
    "sel_F": ["#bodymatter .figure-wrap figure[id^='F'] figcaption"],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": "#bodymatter .figure-wrap",
        "title": "figure[id^='T'] figcaption",
        "table": "figure[id^='T'] table",
        "footer": ""
      }
    ]
  },
  "10.1074": {
    "sel_A": [
      ".article__sections section:first-child:not(section[id^=\"cesec\"])"
    ],
    "sel_R": "a[role=\"doc-biblioref\"]",
    "sel_P": [".article__sections section[id^=\"cesec\"] > .section-paragraph"],
    "sel_F": [".article__sections figure figcaption .figure__title"],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": ".article__sections [id^=\"tb\"]",
        "title": ".inline-table__head",
        "table": "table",
        "footer": ".inline-table__tail"
      }
    ]
  },
  "10.3389": {
    "sel_A": [
      ".JournalAbstract > p",
      ".JournalAbstract .authors+.notes~p"
    ],
    "sel_R": "a[href^='#B']",
    "sel_P": [
      ".JournalFullText p",
      ".ArticleDetails__main__content__main .JournalFullText p",
      ".article-container .JournalFullText > p"
    ],
    "sel_F": [
      ".FigureDesc p",
      ".Imageheaders ~ .FigureDesc p"
    ],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": ".FigureDesc, .table-wrap",
        "title": "p, .Caption",
        "table": "table",
        "footer": ""
      }
    ]
  },
  "10.1186": {
    "sel_A": ["[data-title=\"Abstract\"] .c-article-section__content"],
    "sel_R": "a[data-test=\"citation-ref\"]",
    "sel_P": [
      "article section:not([data-title=\"Abstract\"]):not(#MagazineFulltextArticleBodySuffix ~ section) .c-article-section__content > p"
    ],
    "sel_F": [
      "article [id^=\"figure\"] .c-article-section__figure-description"
    ],
    "sel_S": [
      "article [id^=\"scheme\"] .c-article-section__figure-description"
    ],
    "sel_T": [
      {
        "wrapper": "",
        "title": "",
        "table": "",
        "footer": ""
      }
    ]
  },
  "10.3762": {
    "sel_A": ["#articleContent #abstract p"],
    "sel_R": "a[id^=\"link\"]",
    "sel_P": ["#articleContent .text-bs > p"],
    "sel_F": ["#articleContent figure img[id^='figure']~figcaption > p"],
    "sel_S": ["#articleContent figure img[id^='scheme']~figcaption > p"],
    "sel_T": [
      {
        "wrapper": "#articleContent a[id^='T'] ~ figure",
        "title": "figcaption > p",
        "table": ".table-responsive table",
        "footer": "#articleContent a[id^='T'] ~ figure ~ p"
      }
    ]
  },
  "10.1371": {
    "sel_A": [".article-content .abstract-content p"],
    "sel_R": "a.ref-tip[href*=ref]",
    "sel_P": [".article-content #artText div[id^=\"section\"] > p"],
    "sel_F": [".article-content .figure :where(.figcaption, .figcaption~p)"],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": ".article-content .figure",
        "title": ":where(.figcaption, .figcaption~p)",
        "table": "",
        "footer": ""
      }
    ]
  },
  "10.1051": {
    "sel_A": [
      "#abstract [role=\"paragraph\"]"
    ],
    "sel_R": "a[role=\"doc-biblioref\"]",
    "sel_P": [
      ".core-container section [role=\"paragraph\"]"
    ],
    "sel_F": [
      "figure.graphic figcaption"
    ],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": "figure.table",
        "title": "figcaption",
        "table": "table",
        "footer": ".notes"
      }
    ]
  },
  "10.1016": {
    "sel_A": [
      "div.abstract.author > div",
      "[data-left-hand-nav=\"Summary\"]",
      "article #author-abstract [id^=abspara]"
    ],
    "sel_R": ":where(a.workspace-trigger, a[href^=\"#bib\"])",
    "sel_P": [
      "div#body > div:first-child > section[id^=s] p[id^=p]",
      "div#body > div:first-child  :where(section[id^=aep-section] > p, section[id^=aep-section] div > p)",
      "[id^='sec'] .section-paragraph",
      "div#body [id^='sec'] p[id^='par']",
      "article #bodymatter [id^=sec-] [role=\"paragraph\"]",
      "div#body section[id^='s'] [id^='p']",
      "#body section[id^=aep-section] :where(h2,h3,h4) ~ div",
      "#body section[id^=sec] :where(h2,h3,h4) ~ div"
    ],
    "sel_F": ["div#body figure .captions"],
    "sel_S": ["div#body figure .captions"],
    "sel_T": [
      {
        "wrapper": "div#body  .tables",
        "title": ".captions",
        "table": "table",
        "footer": [".footnotes", ".legend ~ p"]
      }
    ]
  },
  "10.1108": {
    "sel_A": [
      "section.abstract .sec p",
      "section.abstract p"
    ],
    "sel_R": "a.xref-bibr",
    "sel_P": [
      ".article-section-wrapper > p"
    ],
    "sel_F": [
      ".fig .fig-caption"
    ],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": ".table-wrap",
        "title": ".table-wrap-title .caption",
        "table": ".table-overflow table",
        "footer": ""
      }
    ]
  },
  "10.1515": {
    "sel_A": [
      ".article .abstract > p",
      ".abstract > p"
    ],
    "sel_R": "a.link-bibr",
    "sel_P": [
      ".body > section > p",
      ".body > p"
    ],
    "sel_F": [
      ".figure-wrapper .figure-caption .caption p",
      ".figure-description .figure-caption p"
    ],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": ".table-wrap",
        "title": ".caption p",
        "table": "table",
        "footer": ".table-wrap-foot"
      }
    ]
  },
  "10.1109": {
    "sel_A": [
      "xpl-document-abstract .abstract-text div[xplmathjax]",
      ".abstract-desktop-div .abstract-text h2 + div",
      ".document-abstract .abstract-text div[xplreadinglenshighlight]"
    ],
    "sel_R": "a[ref-type=\"bibr\"]",
    "sel_P": [
      "#article .section p",
      "#BodyWrapper #article p"
    ],
    "sel_F": [
      ".figure .figcaption p",
      "div[id^='fig'] .figcaption p"
    ],
    "sel_S": [],
    "sel_T": []
  },
  "10.1017": {
    "sel_A": [
      ".abstract-content .abstract p",
      ".abstract-text-container .abstract p"
    ],
    "sel_R": "a.bibr",
    "sel_P": [
      ".body .sec > p",
      ".body .sec > .p"
    ],
    "sel_F": [
      ".fig .caption p",
      ".figure .caption p"
    ],
    "sel_S": [],
    "sel_T": [
      {
        "wrapper": ".table-wrap",
        "title": ".caption p",
        "table": "table",
        "footer": ".footer"
      }
    ]
  }
}
;

window.validators["10.1006"] = window.validators["10.1016"];
window.validators["10.1149"] = window.validators["10.1088"];