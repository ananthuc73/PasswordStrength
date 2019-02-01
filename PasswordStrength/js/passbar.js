
;(function($) {
  'use strict';

  var Password = function ($object, val) {
    var defaults = {
      shortPassword: 'The password is too short!',
      weakPassword: 'Weak - add some alphabets or numbers',
      goodPassword: 'Medium - try adding some special characters',
      strongPassword: 'Strong password',
      showPercent: false,
      showText: true,
      animate: true,
      animateSpeed: 'fast',
      minimumLength: 4
    };

    val = $.extend({}, defaults, val);
    function rateText(rate) {
      if (rate === -1) {
        return val.shortPassword;
      }
      rate = rate < 0 ? 0 : rate;

      if (rate < 34) {
        return val.weakPassword;
      }
      if (rate < 68) {
        return val.goodPassword;
      }

      return val.strongPassword;
    }
    function calculaterate(password, username) {
      var rate = 0;

      // password < val.minimumLength
      if (password.length < val.minimumLength) {
        return -1;
      }

      if (val.username) {
        // password === username
        if (password.toLowerCase() === username.toLowerCase()) {
          return -2;
        }
      }

      // password length
      rate += password.length * 4;
      rate += checkRepetition(1, password).length - password.length;
      rate += checkRepetition(2, password).length - password.length;
      rate += checkRepetition(3, password).length - password.length;
      rate += checkRepetition(4, password).length - password.length;

      // password has 3 numbers
      if (password.match(/(.*[0-9].*[0-9].*[0-9])/)) {
        rate += 5;
      }

      // password has at least 2 sybols
      var symbols = '.*[!,@,#,$,%,^,&,*,?,_,~]';
      symbols = new RegExp('(' + symbols + symbols + ')');
      if (password.match(symbols)) {
        rate += 5;
      }

      // password has Upper and Lower chars
      if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
        rate += 10;
      }

      // password has number and chars
      if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
        rate += 15;
      }

      // password has number and symbol
      if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([0-9])/)) {
        rate += 15;
      }

      // password has char and symbol
      if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) && password.match(/([a-zA-Z])/)) {
        rate += 15;
      }

      // password is just numbers or chars
      if (password.match(/^\w+$/) || password.match(/^\d+$/)) {
        rate -= 10;
      }

      if (rate > 100) {
        rate = 100;
      }

      if (rate < 0) {
        rate = 0;
      }

      return rate;
    }


    function checkRepetition(rLen, str) {
      var res = "", repeated = false;
      for (var i = 0; i < str.length; i++) {
        repeated = true;
        for (var j = 0; j < rLen && (j + i + rLen) < str.length; j++) {
          repeated = repeated && (str.charAt(j + i) === str.charAt(j + i + rLen));
        }
        if (j < rLen) {
          repeated = false;
        }
        if (repeated) {
          i += rLen - 1;
          repeated = false;
        }
        else {
          res += str.charAt(i);
        }
      }
      return res;
    }


    function init() {
      var shown = true;
      var $text = val.showText;
      var $percentage = val.showPercent;
      var $graybar = $('<div>').addClass('pass-graybar');
      var $colorbar = $('<div>').addClass('pass-colorbar');
      var $insert = $('<div>').addClass('pass-wrapper').append(
        $graybar.append($colorbar)
      );

      $object.parent().addClass('pass-strength-visible');
      if (val.animate) {
        $insert.css('display', 'none');
        shown = false;
        $object.parent().removeClass('pass-strength-visible');
      }

      if (val.showPercent) {
        $percentage = $('<span>').addClass('pass-percent').text('0%');
        $insert.append($percentage);
      }

      if (val.showText) {
        $text = $('<span>').addClass('pass-text').html(val.enterPass);
        $insert.append($text);
      }

      $object.after($insert);

      $object.keyup(function() {
        var username = val.username || '';
        if (username) {
          username = $(username).val();
        }

        var rate = calculaterate($object.val(), username);
        $object.trigger('password.rate', [rate]);
        var perc = rate < 0 ? 0 : rate;
        $colorbar.css({
          backgroundPosition: "0px -" + perc + "px",
          width: perc + '%'
        });

        if (val.showPercent) {
          $percentage.html(perc + '%');
        }

        if (val.showText) {
          var text = rateText(rate);
          if (!$object.val().length && rate <= 0) {
            text = val.enterPass;
          }

          if ($text.html() !== $('<div>').html(text).html()) {
            $text.html(text);
            $object.trigger('password.text', [text, rate]);
          }
        }
      });

      if (val.animate) {
        $object.focus(function() {
          if (!shown) {
            $insert.slideDown(val.animateSpeed, function () {
              shown = true;
              $object.parent().addClass('pass-strength-visible');
            });
          }
        });

        $object.blur(function() {
          if (!$object.val().length && shown) {
            $insert.slideUp(val.animateSpeed, function () {
              shown = false;
              $object.parent().removeClass('pass-strength-visible')
            });
          }
        });
      }

      return this;
    }

    return init.call(this);
  }

  // Bind to jquery
  $.fn.password = function(val) {
    return this.each(function() {
      new Password($(this), val);
    });
  };
})(jQuery);
