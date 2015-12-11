/**
 * -- NodeJS script --
 * Read a csv file of soundonsound articles URLs 
 * The csv row format is  label,URL
 * The label is uses as a unique chapter label and it is usually a chapter number
 * Prints a log to the standard output
 * USAGE node strip-col1.js [csv-file]
 */



var jsdom   = require("jsdom");
var request = require("request");
var fs      = require('fs');
//var url     = require('url');
var sanitizer = require('sanitize-html');

var USAGE = "USAGE node strip-col1.js [csv-file]";
// Base epub directory
var basedir = 'epub/OPS/';

// Make directory images if necessary
var imgbasedir = basedir+'images/';

try {
    fs.mkdirSync(imgbasedir);
} catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
}

var csvlinematch = /(\d+),([^\r\n]+)/g;

if (process.argv.length != 3){
  console.log(USAGE);
  return;
}
/**
 * Read CSV line and download the URL
 */
fs.readFile(process.argv[2], function (err, data) {
  if(err) {
    return console.log(err);
  }
  var match;
  while (match = csvlinematch.exec(data)){
    //chapter number with 3 digitos p.ej. 001
    var numcap = match[1];
    var url = match[2];
    jsdom.env(
      url, //baja la url 
      ["http://code.jquery.com/jquery.js"],
        (function (numcap,url){  //closure
          return function (err,window){
            if(err) {
              return console.log(err);
            }
            downloadHTML(window,numcap);
            //console.log("["+numcap+"] > Bajado HTML "+url);
            console.log("["+numcap+"] > Downloaded HTML "+url);
          }
      })(numcap, url));
  }
  
  
    
  
});
  
  
/** 
 * Utility function to add left zero padding to a number casted as a string
 */
String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
      str = padString + str;
    return str;
}

/**
 * Main function to download the page and the asociated images, with some custom rename and regex matching
 * Applies also HTML sanitizing
 */

function downloadHTML (window, numcap) {
    var $context = window.$("div.col1");
    var imgnum=1;
    var imgregex = /(https?\:\/\/media.soundonsound.com\/sos\/[^\.]+\.)[sl](\.\w+)/,
        imgregex2 = /(https?\:\/\/media.soundonsound.com\/sos\/[^\.]+)(\.\w+)/;  
    
    $context.find('img').map(function(i,d){
      
      //var matches = ;
      $currimg = window.$(this);
      var extension = ".gif";
      var filename;
      
      //image name example: http://media.soundonsound.com/sos/apr01/images/fig03c3rdpipeharmonic.s.gif
      //s -> l
      if ( imgregex.exec(d.src) != null){
        
        //console.log(i+':'+d.src);
        uri = d.src.replace(imgregex,function (match, p1, p2, offset, string) {
          extension = p2;
          // final name example fig-001-001.gif
          filename = "fig-"+numcap+"-"+(imgnum +'').lpad('0',3)+extension;
          $currimg.attr('src','images/'+filename);

          return [p1, 'l', p2].join('');
        });

      //image name example: http://media.soundonsound.com/sos/sep01/images/synth_2_4.gif 
      }else if ( (matches = imgregex2.exec(d.src)) != null   ){ 
      
        uri = d.src.replace(imgregex2,function (match, p1, p2, offset, string) {
          extension = p2;
          // final name example fig-001-001.gif
          filename = "fig-"+numcap+"-"+(imgnum +'').lpad('0',3)+extension;
          $currimg.attr('src','images/'+filename);
          
          p1 = p1.slice(0, -1); //borrar la 's'
          
          return [p1, p2 ].join(''); 
        });
        
      }else{
        //log the omitted images
        //console.log("["+numcap+"] ! No se baja la imagen "+d.src);
        console.log("["+numcap+"] ! Won't download "+d.src);
        $currimg.remove();
        return;
      }
      //attach the image before the paragraph
      var parent = $currimg.parents('p');
      parent.before($currimg);
      imgnum++;
      // Request the image
      request({
          uri: uri,
          encoding:'binary'
          }, 
          (function (uri){
            return function(err, response, body) {
              if(err) {
                  return console.log(err);
                }
              //console.log("["+numcap+"] > Bajado imagen "+uri);
              console.log("["+numcap+"] > Downloaded image "+uri);
              fs.writeFile(imgbasedir+filename, body, {encoding:'binary'}, function(err) {
                if(err) {
                  return console.log(err);
                }

                //console.log("["+numcap+"] # Grabado imagen "+filename);
                console.log("["+numcap+"] # Saved imaged "+filename);
              });
            
            }
          })(uri));
    })

    var html = $context.html();
    
    //try to find a title
    var title;
    
    if(($titlesel = $context.find('h2')).length ||  
       ($titlesel = $context.find('p > b').filter(function() {
                      return $(this.parentNode) // get the p element
                        .contents() // get all the child nodes
                        .not(this) // exclude the current `b` element
                        .length === 0; 
          }) ).length)
         
    {
      title = $titlesel.eq(0).text();
      //console.log("["+numcap+"] i Titulo : "+title);
      console.log("["+numcap+"] i Title : "+title);
    }else{
      //console.log("["+numcap+"] ! No encontrado titulo");
      console.log("["+numcap+"] ! Not found title");
    }
     
    var tagPolicy = {
      allowedTags: [ 'h1','h2','h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
        'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
        'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre' ,'img'],
      allowedAttributes: {
        a: [ 'href', 'name', 'target' ],
        img: [ 'src' ]
      },

      selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
      // URL schemes we permit
      allowedSchemes: [ 'http', 'https', 'ftp', 'mailto' ],
      allowedSchemesByTag: {}};
      
    
    html = '<?xml version="1.0" encoding="utf-8"?> \
              <!DOCTYPE html> \
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">   \
            <head> \
              <title>'+title+'</title> \
              <link rel="stylesheet" type="text/css" href="css/book.css" /> \
          </head> \
          <body> \
          <section class="chapter" title="'+title+'" epub:type="chapter" id="introduction">"'+
          sanitizer(html,tagPolicy)+
          "</section></body></html>";
    

    var filename = 'ch'+numcap+'.xhtml';
    fs.writeFile(basedir+filename, html, {}, function(err) {
      if(err) {
        return console.log(err);
      }

      //console.log("["+numcap+"] # Grabado HTML "+filename);
      console.log("["+numcap+"] # Saved HTML "+filename);

    // html name example : ch001.xhtml
    });
  }





