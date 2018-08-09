
// function refreshPop(){
// 	var __fillDB__=JSON.parse(localStorage.__fillDB__);
// 	chrome.runtime.sendMessage(__fillDB__);//send change to plugin
// }

// function fillSelect(){
// 	//no good idea to deal this part

// 	//set the last option selected to void default value (eg:--,please select)
// 	var senum=$("select").length;
// 	for(var i=0;i<senum;i++){
// 		var selectElement=$($("select")[i]);
// 		var optionElement=selectElement.find("option");
// 		var optionLength=optionElement.length;
// 		var selectValue;
// 		// if(optionLength>1){
// 		// 	selectValue=$(selectElement.find("option")[optionLength-1]).val();//avoid default option value
// 		// }else{
// 		// 	selectValue=$(selectElement.find("option")[0]).val();//get first option value
// 		// }
// 		selectValue=(optionLength>1)?$(selectElement.find("option")[optionLength-1]).val():$(selectElement.find("option")[0]).val();
// 		selectElement.val(selectValue);//set select
// 		selectElement.css("outline","2px dotted #F00");//set outline
// 	}

// 	//set the last radio checked
// 	var ranum=$("input[type='radio']").length;
// 	for(var j=0;j<ranum;j++){
// 		var radioElement=$($("input[type='radio']")[j]);
// 		radioElement.css("outline","2px dotted #F00");//set outline
// 		radioElement.attr("checked","checked");
// 	}

// 	//set all checkbox checked
// 	var chnum=$("input[type='checkbox']").length;
// 	for(var n=0;n<chnum;n++){
// 		var checkboxElement=$($("input[type='checkbox']")[n]);
// 		checkboxElement.prop("checked", true);
// 		checkboxElement.css("outline","2px dotted #F00");//set outline
// 	}
// }

// function fillAction(){
// 	$(function(){
// 		fillSelect();//can be cover by below
// 	});

// 	var __fillDB__=JSON.parse(localStorage.__fillDB__);
// 	for(var i=0;i<__fillDB__.length;i++){
// 		$(__fillDB__[i].selector).val(__fillDB__[i].match);
// 		$(__fillDB__[i].selector).css("outline","2px dotted #F00");//set outline
// 		$(__fillDB__[i].selector).attr("ftitle",__fillDB__[i].selector);//set tooltip
// 		$(__fillDB__[i].selector).tooltip({cssClass:"tooltip_caption"});//set tooltip style
// 	}
// }

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
// 	if(request.action == "fill"){
// 		fillAction();
// 	};

// 	if(request.action=="store"){
// 		localStorage.__fillDB__=JSON.stringify(request.transdata);//restore localStorage
// 	}

// 	refreshPop();
// });

// //console.log(chrome.runtime.id);

// if(!localStorage.__fillDB__){
// 	//init if not exsit
// 	localStorage.__fillDB__="[]";
// }

// refreshPop();



// //shift+enter
// $(document).keypress(function(e){
// 	if (e.shiftKey && e.which==13) {
// 		fillAction();
// 	}
// })