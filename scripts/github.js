(function() {

  var EXTENSION_ID="iiiabkbocdghgldlbogfhfbeincckfcg";

  // move the link to flixster's github homepage
  $(".header-logo-invertocat").attr("href", "https://github.com/flixster");


  var MemeViewLink = Backbone.View.extend({
    events : {
      "click .images img" : "selectImage",
      "click .button:not(.disabled)" : "generateMeme",
      "input .fields input" : "keyPress"
    },

    initialize : function(options) {
      var tokens = this.el.id.split('_');
      this.model = new Backbone.Model({
        "id" : tokens[tokens.length-1],
        "username" : "bestrada",
        "password" : "passw0rd"
      });
      _.bindAll(this, "selectImage", "generateMeme", "activateImage", "keyPress", "validateInputs", "onApiResponse");

      this.model.on("change:template_id", this.activateImage);
      this.model.on("change", this.validateInputs);

      var onSuccess = _.bind(function (markup, textStatus, jqXHR) {
        markup = markup.replace(/\$\{EXTENSION_ID\}/g, EXTENSION_ID);
        this.$el.prepend(markup);
      }, this);
      $.get("chrome-extension://" + EXTENSION_ID + "/formFields.html").success(onSuccess);
    },

    selectImage : function(event) {
      event.preventDefault();
      this.model.set({"template_id": $(event.target).data("template")});
    },

    keyPress : function(event) {
      var values = {}, $target = $(event.target);
      values[$target.attr("name")] = $target.val();
      this.model.set(values);
    },

    activateImage : function(model, newValue) {
      this.$el.find("img").each(function eachImage(index, img) {
        var $img = $(img);
        $img[newValue == $img.data('template') ? "addClass" : "removeClass"]("active");
      });
    },

    validateInputs : function(model) {
      var valid =
        model.get("template_id") &&
        model.get("text0") &&
        model.get("text1");
      this.$el.find(".button")[valid ? "removeClass" : "addClass"]("disabled");
    },

    generateMeme : function(event) {
      event.preventDefault();
      var data = this.model.toJSON();
      delete data.id;
      $.post("https://api.imgflip.com/caption_image", data, this.onApiResponse, "json");
    },

    onApiResponse : function(result, textStatus, jqXHR) {
      var imgUrl = result.data.url;
      var string = "[![meme](" + imgUrl + " \"" +
        this.model.get("text0") + " " + this.model.get("text1") + "\")]" +
        "(https://chrome.google.com/webstore/detail/meme-requests/iiiabkbocdghgldlbogfhfbeincckfcg)";

      this.$el.find("textarea.comment-form-textarea").val(string);
    }
  });

  // first initialize MemeViewLinks for all existing comment forms
  _.each($(".write-content.js-write-bucket.js-uploadable-container"), function eachWriteBucket(writeBucket) {
    new MemeViewLink({"el" : writeBucket});
  });

  // now listen for dom changes in case new .js-write-bucket appears
  /*
  var commentObserver = new WebKitMutationObserver(function onMutate(mutations) {
    debugger;
  });
  _.each($("table.file-code.file-diff"), function eachCodeTable(table) {
    commentObserver.observe(table, { childList: true });
  });
  */
})();
