!function(){"use strict";angular.module("app",["infinite-scroll","ngAnimate","ngMaterial","ngStorage","ui.router"]).run(["$rootScope","reddit",function(a,b){b.attemptRefresh()}])}(),function(){"use strict";angular.module("app").config(["$urlRouterProvider","$stateProvider","$locationProvider",function(a,b,c){c.html5Mode({enabled:!0,requireBase:!1}),b.state("top",{url:"/?access_token&state",templateUrl:"views/top.html",controller:"TopCtrl",controllerAs:"topctrl",resolve:{}}).state("favorites",{url:"/favorites",templateUrl:"views/favorites.html",controller:"FavoritesCtrl",controllerAs:"favoritesctrl"}).state("404",{url:"/404",template:"<div class='container'><div class='row'><h1 class='col-xs-12 text-center'>404</h1><h3 class='col-xs-12 text-center text-uppercase'>Page Not Found</h3><h4 class='col-xs-12 text-center text-uppercase'>Sorry, but the page you were trying to view does not exist.</h4></div></div>"}),a.otherwise("/")}])}(),function(){angular.module("app").factory("bowser",[function(){function a(a){function c(b){var c=a.match(b);return c&&c.length>1&&c[1]||""}function d(b){var c=a.match(b);return c&&c.length>1&&c[2]||""}var e,f=c(/(ipod|iphone|ipad)/i).toLowerCase(),g=/like android/i.test(a),h=!g&&/android/i.test(a),i=/CrOS/.test(a),j=c(/edge\/(\d+(\.\d+)?)/i),k=c(/version\/(\d+(\.\d+)?)/i),l=/tablet/i.test(a),m=!l&&/[^-]mobi/i.test(a);/opera|opr/i.test(a)?e={name:"Opera",opera:b,version:k||c(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)}:/yabrowser/i.test(a)?e={name:"Yandex Browser",yandexbrowser:b,version:k||c(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)}:/windows phone/i.test(a)?(e={name:"Windows Phone",windowsphone:b},j?(e.msedge=b,e.version=j):(e.msie=b,e.version=c(/iemobile\/(\d+(\.\d+)?)/i))):/msie|trident/i.test(a)?e={name:"Internet Explorer",msie:b,version:c(/(?:msie |rv:)(\d+(\.\d+)?)/i)}:i?e={name:"Chrome",chromeBook:b,chrome:b,version:c(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)}:/chrome.+? edge/i.test(a)?e={name:"Microsoft Edge",msedge:b,version:j}:/chrome|crios|crmo/i.test(a)?e={name:"Chrome",chrome:b,version:c(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)}:f?(e={name:"iphone"==f?"iPhone":"ipad"==f?"iPad":"iPod"},k&&(e.version=k)):/sailfish/i.test(a)?e={name:"Sailfish",sailfish:b,version:c(/sailfish\s?browser\/(\d+(\.\d+)?)/i)}:/seamonkey\//i.test(a)?e={name:"SeaMonkey",seamonkey:b,version:c(/seamonkey\/(\d+(\.\d+)?)/i)}:/firefox|iceweasel/i.test(a)?(e={name:"Firefox",firefox:b,version:c(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)},/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(a)&&(e.firefoxos=b)):/silk/i.test(a)?e={name:"Amazon Silk",silk:b,version:c(/silk\/(\d+(\.\d+)?)/i)}:h?e={name:"Android",version:k}:/phantom/i.test(a)?e={name:"PhantomJS",phantom:b,version:c(/phantomjs\/(\d+(\.\d+)?)/i)}:/blackberry|\bbb\d+/i.test(a)||/rim\stablet/i.test(a)?e={name:"BlackBerry",blackberry:b,version:k||c(/blackberry[\d]+\/(\d+(\.\d+)?)/i)}:/(web|hpw)os/i.test(a)?(e={name:"WebOS",webos:b,version:k||c(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)},/touchpad\//i.test(a)&&(e.touchpad=b)):e=/bada/i.test(a)?{name:"Bada",bada:b,version:c(/dolfin\/(\d+(\.\d+)?)/i)}:/tizen/i.test(a)?{name:"Tizen",tizen:b,version:c(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i)||k}:/safari/i.test(a)?{name:"Safari",safari:b,version:k}:{name:c(/^(.*)\/(.*) /),version:d(/^(.*)\/(.*) /)},!e.msedge&&/(apple)?webkit/i.test(a)?(e.name=e.name||"Webkit",e.webkit=b,!e.version&&k&&(e.version=k)):!e.opera&&/gecko\//i.test(a)&&(e.name=e.name||"Gecko",e.gecko=b,e.version=e.version||c(/gecko\/(\d+(\.\d+)?)/i)),e.msedge||!h&&!e.silk?f&&(e[f]=b,e.ios=b):e.android=b;var n="";e.windowsphone?n=c(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i):f?(n=c(/os (\d+([_\s]\d+)*) like mac os x/i),n=n.replace(/[_\s]/g,".")):h?n=c(/android[ \/-](\d+(\.\d+)*)/i):e.webos?n=c(/(?:web|hpw)os\/(\d+(\.\d+)*)/i):e.blackberry?n=c(/rim\stablet\sos\s(\d+(\.\d+)*)/i):e.bada?n=c(/bada\/(\d+(\.\d+)*)/i):e.tizen&&(n=c(/tizen[\/\s](\d+(\.\d+)*)/i)),n&&(e.osversion=n);var o=n.split(".")[0];return l||"ipad"==f||h&&(3==o||4==o&&!m)||e.silk?e.tablet=b:(m||"iphone"==f||"ipod"==f||h||e.blackberry||e.webos||e.bada)&&(e.mobile=b),e.msedge||e.msie&&e.version>=10||e.yandexbrowser&&e.version>=15||e.chrome&&e.version>=20||e.firefox&&e.version>=20||e.safari&&e.version>=6||e.opera&&e.version>=10||e.ios&&e.osversion&&e.osversion.split(".")[0]>=6||e.blackberry&&e.version>=10.1?e.a=b:e.msie&&e.version<10||e.chrome&&e.version<20||e.firefox&&e.version<20||e.safari&&e.version<6||e.opera&&e.version<10||e.ios&&e.osversion&&e.osversion.split(".")[0]<6?e.c=b:e.x=b,e}var b=!0,c=a("undefined"!=typeof navigator?navigator.userAgent:"");return c.test=function(a){for(var b=0;b<a.length;++b){var d=a[b];if("string"==typeof d&&d in c)return!0}return!1},c._detect=a,c}])}(),function(){"use strict";function a(a,b,c,d,e){function f(){var a=window.Snoocore;y=new a({userAgent:"test@reddit-client3",oauth:{type:"implicit",key:"JsanZ0aOnw0PVA",redirectUri:A,scope:["identity","read","save","history"]}}),B.saved={after:null,callbacks:[],data:[],lastCheck:null,uri:d.user?"/user/"+d.user.name+"/saved":null},B.top={after:null,callbacks:[],data:[],lastCheck:null,uri:"/r/all/top"}}function g(){var a=c.defer();return t()?p(b.accessToken.code):(a.resolve(),a.promise)}function h(a,e){if(d.user){var f=c.defer();return f.resolve(d.user),f.promise}return d.loggingIn=!0,B.saved&&B.saved.data.length&&(b.dirtySaves=B.saved.data),b.accessToken?t()?p(b.accessToken.code):(delete b.accessToken,k()):a&&e?n(a,e):k()}function i(){var a=c.defer();return y.deauth().then(function(c){d.user=null,delete b.accessToken,_.each(["saved","top"],function(a){B[a].data=[],B[a].after=null,B[a].before=null,B[a].lastCheck=null,m(a)}),j("top").then(function(){_.each(B.top.data,function(a){a.data.saved=!1})}),a.resolve()},function(b){a.reject(b)}),a.promise}function j(a){return x().then(function(){if("saved"===a&&!d.user){var b=c.defer();return m("saved"),b.resolve(B.saved.data),b.promise}return B[a].data.length&&B[a].lastCheck&&moment().diff(B.top.lastCheck)<z?(B[a].lastCheck=moment(),o(a)):(B[a].lastCheck=moment(),B[a].data=[],l(a))})}function k(){var a=c.defer(),b=Math.random().toString(36).substring(7),d=y.getImplicitAuthUrl(b);return e.authState=b,a.resolve(),window.location=d,a.promise}function l(a){var b=c.defer();return x().then(function(){if("saved"===a&&!d.user)return m("saved"),b.resolve(B.saved.data),b.promise;var c;B[a].after&&(c={after:B[a].after}),y(B[a].uri).get(c).then(function(c){c.data.after?(B[a].after=c.data.after,B[a].data=B[a].data.concat(c.data.children)):B[a].data=c.data.children,"saved"===a&&u(),m(a),b.resolve(B[a].data)},function(a){b.reject(a)})}),b.promise}function m(a){angular.forEach(B[a].callbacks,function(b){b(B[a])})}function n(a,f){var g=c.defer();return e.authState!==f?g.reject("INVALID_STATE"):delete e.authState,y.auth(a).then(function(){return b.accessToken={code:a,expires:moment().add(1,"hour").toDate()},y("/api/v1/me").get()}).then(function(a){d.user=a,B.saved.uri="/user/"+d.user.name+"/saved",s(),d.loggingIn=!1,g.resolve(a)},function(a){d.loggingIn=!1,g.reject(a)}),g.promise}function o(a){var b=c.defer(),d={before:B[a].data[0].kind+"_"+B[a].data[0].data.id,limit:100};return y(B[a].uri).get(d).then(function(c){B[a].data=c.data.children.concat(B[a].data),c.data.before?o(a):("saved"===a&&u(),b.resolve(B[a].data),m(a))},function(a){b.reject(a)}),b.promise}function p(a){var e=c.defer();return d.loggingIn=!0,y.auth(a).then(function(){return y("/api/v1/me").get()}).then(function(a){d.user=a,d.user=d.user,B.saved.uri="/user/"+d.user.name+"/saved",s(),d.loggingIn=!1,e.resolve(a)},function(a){console.error(a),delete b.accessToken,e.reject(a)}),e.promise}function q(a,b){return B[a].callbacks.push(b),B[a].callbacks.length}function r(a,b){var e=c.defer();if(!d.user){var f={kind:a,data:b};return e.resolve(B.saved.data.push(f)),m("saved"),e.promise}var g=a+"_"+b.id,h={id:g};y("/api/save").post(h).then(function(a){m("saved"),e.resolve(a)},function(a){e.reject(a)})}function s(){if(b.dirtySaves&&b.dirtySaves.length){var a=_.map(b.dirtySaves,function(a){return r(a.kind,a.data)});c.all(a).then(function(a){j("saved").then(function(a){console.log("override dirty saves",a),delete b.dirtySaves},function(a){delete b.dirtySaves,console.error(a)})},function(a){console.error(a)})}else j("saved").then(function(a){},function(a){console.error(a)})}function t(){return!d.user&&b.accessToken&&moment(b.accessToken.expires).diff(moment())>0}function u(){if(B.top.data.length&&B.saved.data.length){var a={};_.each(B.top.data,function(b,c){a[b.data.id]=c}),_.each(B.saved.data,function(b){B.top.data[a[b.data.id]]=b}),m("top")}}function v(a,b){B[a].callbacks.splice(b,1)}function w(a,b){function e(){function c(){_.each(B.top.data,function(a){a.data&&a.data.id===d.data.id&&a.kind===d.kind&&(a.data.saved=!1)})}var d={kind:a,data:b},e=_.reject(B.saved.data,function(a){return a.data&&a.data.id===d.data.id&&a.kind===d.kind});B.saved.data=e,c(),m("saved")}if(!d.user){var f=c.defer();return e(),f.resolve(B.saved.length),f.promise}var g=a+"_"+b.id,h={id:g};y("/api/unsave").post(h).then(function(){e()})}function x(){var a=c.defer();if(d.loggingIn)var b=d.$watch("loggingIn",function(c){c||(a.resolve(d.user),b())});else a.resolve(d.user);return a.promise}var y,z=3e5,A=window.location.origin,B=this;return f(),{attemptRefresh:g,firstPage:j,login:h,logout:i,nextPage:l,registerCallback:q,save:r,saved:B.saved.data,top:B.top.data,unregisterCallback:v,unsave:w,user:d.user,waitForUser:x}}angular.module("app").factory("reddit",a),a.$inject=["$http","$localStorage","$q","$rootScope","$sessionStorage"]}(),function(){function a(a,b){function c(c,d,e){c.bowser=a,c.toggleFavorite=function(){c.data.saved=!c.data.saved,c.data.saved?b.save(c.kind,c.data):b.unsave(c.kind,c.data)}}var d={link:c,templateUrl:"views/directives/post.html",restrict:"EA",replace:!0,scope:{data:"=",kind:"@"}};return d}angular.module("app").directive("post",a),a.$inject=["bowser","reddit"]}(),function(){function a(a,b,c){function d(d,e,f){d.bowser=b,d.login=function(){c.login().then(function(){},function(a){console.error(a),d.showError("an error occurred while trying to log you in")})},d.logout=function(){c.logout().then(function(){},function(a){console.error(a),d.showError("an error occurred while trying to log you out")})},d.showError=function(b){a.show(a.simple().textContent(b).hideDelay(3e3))}}var e={link:d,templateUrl:"views/directives/toolbar.html",restrict:"EA",replace:!0,scope:{user:"="}};return e}angular.module("app").directive("toolbar",a),a.$inject=["$mdToast","bowser","reddit"]}(),function(){"use strict";function a(a,b,c,d,e,f){function g(){var a=function(a){k.posts=a.data,k.more=a.after};l=f.registerCallback("top",a),k.loading=!0,e.access_token?f.login(e.access_token,e.state).then(function(){d.go(".",{code:void 0,state:void 0}),h()},function(){k.loading=!1,d.go(".",{code:void 0,state:void 0})}):h()}function h(){k.loading=!0,f.firstPage("top").then(function(a){k.loading=!1},function(a){k.loading=!1,console.error(a),k.showError("could not retrieve more posts")})}function i(){k.more&&(k.loading=!0,f.nextPage("top").then(function(a){k.loading=!1},function(a){k.loading=!1,console.error(a),k.showError("could not retrieve more posts")}))}function j(a){b.show(b.simple().textContent(a).hideDelay(3e3))}var k=this;k.nextPage=i,k.showError=j;var l;g(),c.$on("$destroy",function(){(l||0===l)&&f.unregisterCallback("top",l)})}angular.module("app").controller("TopCtrl",a),a.$inject=["$localStorage","$mdToast","$scope","$state","$stateParams","reddit"]}(),function(){function a(a,b,c,d,e){function f(){var a=function(a){j.posts=a.data,j.more=a.after};k=e.registerCallback("saved",a),j.loading=!0,g()}function g(){j.loading=!0,e.firstPage("saved").then(function(){j.loading=!1},function(a){j.loading=!1,console.error(a),j.showError("could not retrieve more favorites")})}function h(){j.more&&(j.loading=!0,e.nextPage("saved").then(function(){j.loading=!1},function(a){j.loading=!1,console.error(a),j.showError("could not retrieve more favorites")}))}function i(a){b.show(b.simple().textContent(a).hideDelay(3e3))}var j=this;j.nextPage=h,j.showError=i;var k;f(),c.$on("$destroy",function(){(k||0===k)&&e.unregisterCallback("saved",k)})}angular.module("app").controller("FavoritesCtrl",a),a.$inject=["$localStorage","$mdToast","$scope","$stateParams","reddit"]}(),angular.module("app").run(["$templateCache",function(a){"use strict";a.put("views/directives/post.html",'<md-card> <md-card-title-media ng-if="(bowser.mobile || bowser.tablet) && data.thumbnail && data.thumbnail !== \'nsfw\' && data.thumbnail !== \'self\' && data.thumbnail !== \'default\'"> <div class="md-media-lg card-media"> <a ng-href="https://www.reddit.com/{{data.permalink}}" target="_blank"><img ng-src="{{data.thumbnail}}"></a> </div> </md-card-title-media> <md-card-title> <md-card-title-media ng-if="!bowser.mobile && !bowser.tablet && data.thumbnail && data.thumbnail !== \'nsfw\' && data.thumbnail !== \'self\' && data.thumbnail !== \'default\'"> <div class="md-media-lg card-media"> <a ng-href="https://www.reddit.com/{{data.permalink}}" target="_blank"><img ng-src="{{data.thumbnail}}"></a> </div> </md-card-title-media> <md-card-title-text> <a ng-href="https://www.reddit.com/{{data.permalink}}" target="_blank"><span class="md-headline">{{data.title}}</span></a> <a ng-href="https://www.reddit.com/user/{{data.author}}" target="_blank"><span class="md-subhead">{{data.author}}</span></a> </md-card-title-text> </md-card-title> <md-card-actions layout="row" layout-align="end center"> <md-button class="md-icon-button md-accent" aria-label="Favorite" ng-click="toggleFavorite()"><i class="material-icons">{{data.saved ? \'favorite\' : \'favorite_border\'}}</i></md-button> </md-card-actions> </md-card>'),a.put("views/directives/toolbar.html",'<md-content> <md-toolbar> <div class="md-toolbar-tools"> <md-button class="md-icon-button" aria-label="Settings" ui-sref="top"> <img src="images/logo.png"> </md-button> <h2 ng-if="!(bowser.mobile || bowser.tablet)"> <span>Reddit Client</span> </h2> <span flex></span> <md-button class="md-button" aria-label="Top" ui-sref="top" ui-sref-active="active"> top </md-button> <md-button class="md-button" aria-label="Favorites" ui-sref="favorites" ui-sref-active="active"> favorites </md-button> <md-button class="md-button" aria-label="Login" ng-click="login()" ng-if="!user && !$root.loggingIn"> log in </md-button> <md-button class="md-button" aria-label="Logout" ng-click="logout()" ng-if="user && !$root.loggingIn"> log out {{user.name}} </md-button> </div> </md-toolbar> </md-content>'),a.put("views/favorites.html",'<div> <md-content class="md-padding" layout="row" layout-wrap layout-align="center start" layout-xs="column"> <div flex="50" flex-sm="100" flex-xs="100" layout="column" infinite-scroll="favoritesctrl.nextPage()" infinite-scroll-disabled="favoritesctrl.loading" infinite-scroll-distance="1"> <post class="animate-repeat" ng-repeat="post in favoritesctrl.posts" data="post.data" kind="{{post.kind}}"></post> </div> <div class="loading" ng-if="favoritesctrl.loading"> <md-progress-circular md-mode="indeterminate"></md-progress-circular> </div> </md-content> </div>'),a.put("views/top.html",'<div> <md-content class="md-padding" layout="row" layout-wrap layout-align="center start" layout-xs="column"> <div flex="50" flex-sm="100" flex-xs="100" layout="column" infinite-scroll="topctrl.nextPage()" infinite-scroll-disabled="topctrl.loading" infinite-scroll-distance="1"> <post class="animate-repeat" ng-repeat="post in topctrl.posts" data="post.data" kind="{{post.kind}}"></post> </div> <div class="loading" ng-if="topctrl.loading"> <md-progress-circular md-mode="indeterminate"></md-progress-circular> </div> </md-content> </div>')}]);