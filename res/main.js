function reloadFile(){
	var path = document.getElementById('input_file').value;
	typeof external['reloadFile'] == 'function' && external.reloadFile(path);
}
function openFileDlg(){
	typeof external['openFileDlg'] == 'function' && external.openFileDlg();
}
function selectRecent(sender){
	var id=sender.id, path=sender.innerText;
	setFilePath(path);
	typeof external['selectFile'] == 'function' && external.selectFile(path);
}
function getVersion(){
	return typeof external['getVersion'] == 'function' && external.getVersion();
}
function getVid(){
	return typeof external['getVid'] == 'function' && external.getVid();
}
function getUrl(){
	return typeof external['getUrl'] == 'function' && external.getUrl();
}

function openUrl(url){
	typeof external['openUrl'] == 'function' && external.openUrl(url);
}

function showRecent(event){
	if(recent_wrapper.children.length>0){
		recent_wrapper.style.display='block';
		event.stopPropagation();
	}
}
function hideRecent(){
	recent_wrapper.style.display='none';
}
function addRecent(id, path){
	if (!document.getElementById(id)) {
		var li = document.createElement('li');
		li.id = id;
		li.innerText = path;
		li.addEventListener('click', function(){
			selectRecent(this);
		});
		recent_wrapper.appendChild(li);
		li = null;
	}
}
function remRecent(id){
	if (!document.getElementById(id)) {
		recent_wrapper.removeChild(document.getElementById(id));
	}
}
function msg(msg){
	alert(msg);
}


Array.prototype.sum = function (){
    var _self = this;
    if (_self.length == 0) return 0;
    if (_self.length == 1) return _self[0];
    var middle = Math.floor(_self.length / 2);
    return _self.slice(0, middle).sum() + _self.slice(middle).sum();
};
//aardio interface
function setFilePath(path){
	document.getElementById('input_file').value = path;
}
//Global vars
var getStyle = window.getComputedStyle;
var tips_box = document.getElementById('tips_box');
var recent_wrapper = document.getElementById('recent_wrapper');
var mm = function (m1, m2){
        return [
            m1[0][0]*m2[0]+m1[0][1]*m2[1],
            m1[1][0]*m2[0]+m1[1][1]*m2[1]
        ];
    };
var layout = {
        up:    [[0,  0], [0, -1]],
        down:  [[0,  0], [0,  1]],
        left:  [[-1, 0], [0,  0]],
        right: [[1,  0], [0,  0]]
    };
var locate = function (ele, flag, sender, event, callback){
	var offset = mm(layout[flag], getEleM(sender)).sum();
	var start = 0, prop;
	var eleStyle = getStyle(ele);
	switch(flag){
		case 'up':
			prop = 'top';
			offset += -1*parseInt(eleStyle.height);
			start = event.pageY;
			typeof(callback)=='function' && callback('bottom');
			break;
		case 'down':
			prop = 'top';
			start = event.pageY;
			typeof(callback)=='function' && callback('top');
			break;
		case 'left':
			prop = 'left';
			offset += -1*parseInt(eleStyle.width);
			start = event.pageX;
			typeof(callback)=='function' && callback('right');
			break;
		case 'right':
			prop = 'left';
			start = event.pageX;
			typeof(callback)=='function' && callback('left');
			break;
	}
	ele.style[prop] = (+start + +offset) + 'px';
};

function tips_position(sender, event){
    //console.log(arguments);
    var ww=window.innerWidth, wh=window.innerHeight;
	var _bdrdscls = '{vertial}-{horizontal}-square';
    if (event.clientX < ww / 2) {
        locate(tips_box, 'right', sender, event, function(ort){
			_bdrdscls = _bdrdscls.replace(/\{horizontal\}/, ort);
		}); // left = pageX + offset
    } else {
        locate(tips_box, 'left', sender, event, function(ort){
			_bdrdscls = _bdrdscls.replace(/\{horizontal\}/, ort);
		}); // left = pageX - self.width - offset
    }
    if (event.clientY < wh / 2) {
        locate(tips_box, 'down', sender, event, function(ort){
			_bdrdscls = _bdrdscls.replace(/\{vertial\}/, ort);
		}); //top = pageY + offset
    } else {
        locate(tips_box, 'up', sender, event, function(ort){
			_bdrdscls = _bdrdscls.replace(/\{vertial\}/, ort);
		}); // top = pageY - self.height - offset
    }
	
	_bdrdscls.indexOf('{') == -1 && (remClses(tips_box, ['top-left-square', 'top-right-square', 'bottom-left-square', 'bottom-right-square']),tips_box.classList.add(_bdrdscls));
}

function remClses(ele, clses){
	for(var i=0; i<clses.length; i++){
		ele.classList.remove(clses[i]);
	}
}

function getEleM(ele){
	var eleStyle = getStyle(ele);
    var m = [parseInt(eleStyle.width), parseInt(eleStyle.height)];
    return m;
}

function ajax(options){
	var ajax = new XMLHttpRequest();
	ajax.open(options.type, options.url, options.async || true);
	ajax.send(options.data || {});
	ajax.onreadystatechange = function () {
		if (ajax.readyState==4 && ajax.status==200) {
			typeof options.onRaw == 'function' && options.onRaw(ajax.responseText);
			options.onSuccess(JSON.parse(ajax.responseText), ajax);
		}
	}
}

function getAbout(){
	var ver = getVersion();
	var url = getUrl();
	var compareVer = function(ver1, ver2){
		return ver1 > ver2 ? 1 : (ver1 < ver2 ? -1 : 0);
	};
	var isHomePage = typeof(renderTpl)=='function'?1:0;
	ajax({
		type: 'get',
		url: url+'&ishomepage=' + isHomePage,
		data: {},
		onSuccess: function(res){
			//alert(res.vid);
			if (compareVer(ver, res.ver) == -1) {
				document.getElementById('about_btn_dot').classList.add('hidot');
				$$('new_version').innerHTML = 'New version: <a href="javascript:openUrl(\''+res.url+'\');">' + res.ver + ' (click to download)</a>';
			} else {
				$$('new_version').innerHTML = 'The version is the newest.';
			}
			$$('cur_version').innerText = 'v' + ver;
			$$('contact').innerHTML = 'Contact: <a href="javascript:openUrl(\'mailto:'+res.contact+'\');">'+res.contact+'</a>';
			$$('other_msg').innerHTML = res.msg;
		}
	});
}

function $$(id){
	return document.getElementById(id);
}

function popupwin(){
	$$('popupwin').style.display = 'block';
}

window.onload = function () {
    var objs = document.querySelectorAll('li div:first-child');
    var collapse = function (e){
        var child2 = this.parentNode.querySelector('div:nth-child(2)');
        if (!child2) return;
        var ul_of_child2 = child2.querySelector('ul');
        if (ul_of_child2) {
            var status = ul_of_child2.style.display;
            if (status == 'none') {
                ul_of_child2.style.display = 'block';
                this.querySelector('dl').setAttribute('data-clps', '-');
            } else {
                ul_of_child2.style.display = 'none';
                this.querySelector('dl').setAttribute('data-clps', '+');
            }
            child2.classList.toggle('esclipe');//instead of switching between add() and remove()
        }
    }
    document.querySelector('.root-hd').addEventListener("click", collapse, false);
    for (var i=0; i<objs.length; i++) {
        objs[i].addEventListener("click", collapse, false);
    }
    
    var icons = document.querySelectorAll('dd i');
    for (var i=0; i<icons.length; i++) {
		//webkit不支持mouseenter
        icons[i].addEventListener("mouseover", function (event){
            tips_box.style.display = 'block';
            tips_box.innerText = this.parentNode.querySelector('pre').innerText;
            tips_position(this, event);
        }, false);
    }
    tips_box.addEventListener("mouseout", function (event){
        this.style.display = 'none';
        this.innerText = '';
    }, false);
	
    document.body.addEventListener("click", function (event){
        tips_box.style.display = 'none';
        tips_box.innerText = '';
		hideRecent();
		$$('popupwin').style.display = 'none';
    }, false);
	
	$$('popupwin').addEventListener('click', function (event){
		event.stopPropagation();
	}, false);
	
	$$('closepop').addEventListener('click', function (event){
		$$('popupwin').style.display = 'none';
	}, false);
	
	var pre_set = document.querySelectorAll('dd pre'), pre_style;
    for (var i=0; i<pre_set.length; i++) {
        pre_style = getStyle(pre_set[i]);
        if (parseInt(pre_style.width) < parseInt(pre_style.maxWidth)) {
            (function(obj){obj.add('icon-hide');return obj;})(pre_set[i].parentNode.querySelector('i').classList).remove('icon-show');
        }
    }
	
	var history_lis = document.querySelectorAll('#recent_wrapper li');
	for (var i=0; i<history_lis.length; i++) {
		history_lis[i].addEventListener('click', function(event){
			selectRecent(this);
		});
	}
	
	getAbout();
}

function renderTpl(conf_key, conf_value, conf_highlight, conf_valid, conf_desc){
	return tpl = '<li data-level="1" class="">\
                <div>\
                    <dl data-clps="-" class="pointer">\
                        <dd class="highlight-return">${conf_key}</dd>\
                        <dd class="highlight-symbol">=</dd>\
                        <dd class="highlight-msg2">${conf_value}</dd>\
                        <dd class="${conf_highlight}">${conf_valid}</dd><!--highlight-msg-->\
                        <dd class="highlight-msg2"></dd>\
                        <dd class="highlight-path">${conf_desc}</dd>\
                        <dd class="highlight-line"></dd>\
                        <dd class="highlight-params"></dd>\
                        <dd class="highlight-params func-params"></dd>\
                    </dl>\
                </div>\
            </li>'.replace(/\$\{conf_key\}/, conf_key).replace(/\$\{conf_value\}/,conf_value).replace(/\$\{conf_highlight\}/, conf_highlight).replace(/\$\{conf_valid\}/, conf_valid).replace(/\$\{conf_desc\}/, conf_desc);
}

function setXdebugConfig(json){	
	try{
		var obj = JSON.parse(json), NO=0, YES=1;
		var configs = {
			'xdebug.trace_format':[NO,'1'],
			'xdebug.collect_params':[NO,'3'],
			'xdebug.collect_return':[NO,'1']
		};
		var html = '';
		for( i in obj){
			if(obj.hasOwnProperty(i)){
				if ( configs.hasOwnProperty(i) ){
					configs[i] = [YES, configs[i][1], obj[i]];
				} else {
					configs[i] = [YES, 'ignore', obj[i]];
				}
			}
		}
		for( i in configs){
			if(configs.hasOwnProperty(i)){
				if(configs[i][0]==NO){
					html += renderTpl(i, 'None', 'highlight-msg', 'Undefined', 'Required to set value to ' + configs[i][1]);
				} else {
					if (configs[i][1]=='ignore'){
						html += renderTpl(i,configs[i][2], '' , 'Ignored', 'The configuration should be ignored.');
					}else{
						html += renderTpl(i,configs[i][2], configs[i][1]==configs[i][2] ? 'highlight-func':'highlight-msg',configs[i][1]==configs[i][2] ? 'Yes':'No', configs[i][1]==configs[i][2] ? '':'Required to set value to ' + configs[i][1]);
					}
					
				}
			}
		}
		document.getElementById('items_box').innerHTML = html;
	}catch(e){
	}
}
