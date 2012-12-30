/** 
 * Look under your chair! console.log FOR EVERYONE! 
 *
 * @see http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
 */
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());




/** 
 * Fire function based upon attributes on the body tag. 
 * This is the reason for "template{{ template | camelize }}" in layout/theme.liquid
 *
 * @see http://paulirish.com/2009/markup-based-unobtrusive-comprehensive-dom-ready-execution/
 */
var UTIL = {
 
  fire : function(func,funcname, args){
    var namespace = WRITERS; 
    funcname = (funcname === undefined) ? 'init' : funcname;
    if (func !== '' && namespace[func] && typeof namespace[func][funcname] == 'function'){
      namespace[func][funcname](args);
    } 
  }, 
 
  loadEvents : function(){
    var bodyId = document.body.id;

    // hit up common first.
    UTIL.fire('common');
 
    // do all the classes too.
    $.each(document.body.className.split(/\s+/),function(i,classnm){
      UTIL.fire(classnm);
      UTIL.fire(classnm,bodyId);
    });
  } 
 
}; 
$(document).ready(UTIL.loadEvents);


/** 
 * Page-specific call-backs 
 * Called after dom has loaded.  
 */
var WRITERS = {

  common : {
    init: function(){
      console.info(' > DOM Ready > Init');
      $('html').removeClass('no-js').addClass('js');
      $('.carousel').carousel({interval: 6000});
      searchPlaceholder();
    }
  },

  
  templateProduct : { 
    init: function(){
      console.info(' > Product Template');
      $('#add-to-cart').bind( 'click', addToCart );
      $('#thumbs li:nth-child(5n+5)').addClass('last-in-row');
    }
  }, 

  templateCart : {
    init: function(){
      console.info(' > Cart Template > Init');
      $('#toggle-note').toggle(
        function(){ $('#checkout-addnote').find('textarea').show(); }, 
        function(){ $('#checkout-addnote').find('textarea').hide();  }      
      );
          
    }
  }

}
 

/** 
 * Ajaxy add-to-cart 
 */
function addToCart(e){

  if (typeof e !== 'undefined') e.preventDefault();
  
  var id        = $(this).parents('form').find('[name="id"]').val();
  var quantity  = $(this).parents('form').find('[name="quantity"]').val() || 1;

  $.ajax({ 
    type: 'POST',
    url: '/cart/add.js',
    async: false, 
    cache: false, 
    data: 'quantity=' + quantity + '&id=' + id,
    dataType: 'json',
    error: addToCartFail,
    success: addToCartSuccess,
    cache: false 
  });
  
}
  
function addToCartSuccess (jqXHR, textStatus, errorThrown){

  $.ajax({ 
    type: 'GET',
    url: '/cart.js',
    async: false, 
    cache: false, 
    dataType: 'json',
    success: updateCartDesc  
  });         
  $('#add-to-cart-msg').hide().addClass('success').html('Item added to cart! <a href="/cart" title="view cart">View cart and checkout &raquo;</a>').fadeIn();   
}

function addToCartFail(jqXHR, textStatus, errorThrown){
  var response = $.parseJSON(jqXHR.responseText);
  console.error('PROBLEM ADDING TO CART!', response.description);  
  $('#add-to-cart-msg').addClass('error').text(response.description);
}

function updateCartDesc(data){
  var $cartLinkText = $('.cart-link .icon:first');
  
  switch(data.item_count){
    case 0: 
      $cartLinkText.text('0 items');
      break;
    case 1:
      $cartLinkText.text('1 item');
      break;
    default:
      $cartLinkText.text(data.item_count+' items');
      break;
  }
}



/** 
 * Enable placeholder switcheroo in older browsers. 
 * @see http://webdesignerwall.com/tutorials/cross-browser-html5-placeholder-text  
 */
function searchPlaceholder(){

  if(!Modernizr.input.placeholder){
    $('#top-search-input').focus(function() {
      var input = $(this);
      if (input.val() == input.attr('placeholder')) {
      input.val('');
      input.removeClass('placeholder');
      }
    }).blur(function() {
      var input = $(this);
      if (input.val() == '' || input.val() == input.attr('placeholder')) {
      input.addClass('placeholder');
      input.val(input.attr('placeholder'));
      }
    }).blur();
    $('[placeholder]').parents('form').submit(function() {
      $(this).find('[placeholder]').each(function() {
      var input = $(this);
      if (input.val() == input.attr('placeholder')) {
        input.val('');
      }
      })
    });
  }

}


/** 
 * Contact Form 
 * Client-side email validation. 
 * Email validation function from: http://docs.jquery.com/Plugins/validation
 */
$('.contact-form').submit( function(e){
  
  var emailField = $(this).find('.email:first');
  var errorMsg = '<label class="error-msg" for="'+emailField.attr('id')+'">Please enter a valid email.</label>';
  
  if( !validEmail(emailField.val()) === true ){   
    if( emailField.parent().is('li') ){
      emailField.parent().addClass('has-error').find('.error-msg').remove();
      $('#email').after(errorMsg);
    } else {
      $(this).addClass('has-error').find('.error-msg').remove();
      $(this).append(errorMsg);
    }
    e.preventDefault();   
  }

});
  
function validEmail(value){
  return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
}

