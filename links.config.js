window.BlogLinks = {
  siteOrigin: "https://fabiobahia-blog.github.io/vivendo-com-dolores",
  entries: {
    trombose: {
      postSlug: "o-dia-em-que-descobri-a-trombose",
      title: "O dia em que descobri a trombose",
      excerpt:
        "A ligação do médico, a corrida ao hospital e a oração no caminho até São Paulo.",
    },
    comeco: {
      postSlug: "como-tudo-comecou",
      title: "Como tudo começou",
      excerpt:
        "O início desta jornada com dor crônica e trombose porto-mesentérica.",
    },
    hospital: {
      postSlug: "chegando-no-hospital",
      title: "Chegando no hospital",
      excerpt:
        "Calma antes da tempestade, montanha-russa de especialistas e fé de que tudo daria certo.",
    },
  },
  getByPostSlug: function (postSlug) {
    for (const [code, entry] of Object.entries(this.entries)) {
      if (entry.postSlug === postSlug) {
        return { code: code, postSlug: entry.postSlug, title: entry.title, excerpt: entry.excerpt };
      }
    }
    return null;
  },
  getShortUrl: function (code) {
    return this.siteOrigin + "/l/" + code + "/";
  },
  getCardUrl: function (code) {
    return this.siteOrigin + "/l/" + code + "/card/";
  },
  getPostUrl: function (postSlug) {
    return this.siteOrigin + "/" + postSlug + "/";
  },
};
