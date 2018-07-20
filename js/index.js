var host = 'http://118.178.229.154:2019';   //-----------
var token = GetQueryString("data");

var $voteCount = $('.vote-count'),
    betting = 0,
    scheduleId = 0,
    value = $("#value"),
    commentTime = null,
    keyName = "world_cup_activity_2018",
    size = 10, //查询弹幕条数
    resetData = '',
    commentData = [{
        "id" : "1",
        "comment" : ""
    }
];
// 竞猜积分
$voteCount.keyup(function(){
  return this.value = this.value.replace(/\D/g, '');
});
// 弹幕
CommentList();
startCommentList();
function startCommentList(){
  var second = 0;
  var allTime = 15*60*1000; //页面停留时间
  clearInterval(commentTime);
  commentTime = setInterval(function(){
    CommentList();
    second += 3000;
    if(second >= allTime){
      clearInterval(commentTime);
    }
  },3000);
}

// 初始化弹幕
var barrage = new Barrage({
  wrapper: $(".barrage-area").eq(0),
  tmp: function(data, rank) {
    return '<li class="barrage-item" data-rank="' + rank + '">' + data.comment + '</li>';
  },
  data: commentData,
  speed: 1,
  rank: 4
});

//发送新的弹幕
$("#insert").on("click", function() {
  startCommentList();
  var v = value.val();
  if (!v) {
    return "";
  }
  v = v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot").replace(/'/g, "&#39");
  // 发送弹幕
  SendComment(v);
  barrage.insert({
    comment: v
  }, true);
  value.val("");
});
barrage.begin();

// 弹幕列表
function CommentList(){
  $.ajax({
    url: host + "/worldCupActivity2018CommentList",
    type: "post",
    data: {
      keyName: keyName,
      size: size
    },
    dataType:'json',
    success:function(res){
      if(res.code==0&&res.result.length>0){
        if(resetData!=''){
          if(resetData[0].id==res.result[0].id){
            return;
          }else {
            resetData = res.result;
            // reset所有的数据
            barrage.reset(resetData);
          }
        }else {
          resetData = res.result;
          // reset所有的数据
          barrage.reset(resetData);
        }
      }else if(res.code==30007){
        $('.barrage-box').css({display:'none'});
        $('.barrage-end').css({display:'block'});
        clearInterval(commentTime);
      }
    }
  })
}
// 发送弹幕
function SendComment(comment){
  $.ajax({
    url: host + '/worldCupActivity2018SendComment',
    type: 'post',
    data: {
      token: token,
      keyName: 'world_cup_activity_2018',
      comment:comment
    },
    dataType: 'json',
    success:function(res){
      if(res.code==0){}
    }
  });
}


worldCupActivity2018Info();

// 赛程展示接口
function worldCupActivity2018Info(){
  var resultHtml = '';
  $.ajax({
    url: host + '/worldCupActivity2018Info',
    type: 'post',
    data:{
      token:token
    },
    dataType: 'json',
    success: function(res){
      if(res.code==0){
        var result = res;
        var len = res.result.length;
				// for (var i = 0; i < len; i++) {
				// 	result.result[i].startTime = myDate(res.result[i].startTime);
				// }
				resultHtml = template('matchInfo', result);
        $('.img03').html(resultHtml);
        $('.team1-vote').click(function(){
          siblingsBg($(this),'vote_bg',1);
        });
        $('.team0-vote').click(function(){
          siblingsBg($(this),'vote0_bg',0);
        });
        $('.team2-vote').click(function(){
          siblingsBg($(this),'vote_bg',2);
        });
        for (var j = 0; j < len; j++) {
          var myBetting = res.result[j].myBetting;
          var sId = res.result[j].id;
          var state = parseInt(j);
          // 已投注
          if(myBetting!=-1){
            $('.team-vote').eq(state).find('.team1-vote').unbind();
            $('.team-vote').eq(state).find('.team0-vote').unbind();
            $('.team-vote').eq(state).find('.team2-vote').unbind();
            worldCupActivity2018Detail(myBetting,sId,state,'b');
          }
				}
      }else if(res.code==30007){
        // 结束时 赛程
        $('.img03').html('<div class="match-end"></div>');
        // 结束时，弹幕
        $('.barrage-box').css({display:'none'});
        $('.barrage-end').css({display:'block'});
        clearInterval(commentTime);
      }
    }
  })
}

//世界杯-赔率 / 预计奖励接口
function worldCupActivity2018Detail(betting,scheduleId,_this,count){
  var rateHtml = '';
  $.ajax({
    url: host + '/worldCupActivity2018Detail',
    type: 'post',
    data:{
      token:token,
      betting:betting,
      scheduleId:scheduleId
    },
    dataType: 'json',
    success: function(res){
      if(res.code==0){
        var res = res;
        rateHtml = template('tipsDetail', res);
        if(count!='a'){
          $('.tips-detail').eq(_this).html(rateHtml);
          $('.tips-detail').eq(_this).find('.tips').css({display:'none'});
          $('.tips-detail').eq(_this).find('.integr').css({display:'block'});
        }else {
          _this.parent().parent().next().html(rateHtml);
          _this.parent().parent().next().find('.tips').css({display:'none'});
          _this.parent().parent().next().find('.odds').css({display:'block'});
          _this.parent().parent().parent().find('.vote-btn-grey').css({display:'none'});
          _this.parent().parent().parent().find('.vote-btn').css({display:'block'});
        }
      }
    }
  })
}

//世界杯-首投/加注接口
function worldCupActivity2018Betting(betting,amount,scheduleId){
  $.ajax({
    url: host + '/worldCupActivity2018Betting',
    type: 'post',
    data:{
      token:token,
      betting:betting,
      amount:amount,
      scheduleId:scheduleId
    },
    dataType: 'json',
    success: function(res){
      if(res.code==0){
        if(res.result==0){
          $('.tipin p').html('竞猜成功！');
        }else {
          $('.tipin p').html('加注成功！');
        }
        $('.pop2').css({display: 'block'});
        $('.pop').css({display: 'none'});
        worldCupActivity2018Info();
      }else {
        $('.tipin p').html(res.errorMsg);
        $('.pop2').css({display: 'block'});
      }
    }
  })
}
//世界杯-投注列表
function worldCupActivity2018List(){
  var	html = '';
  $.ajax({
    url: host + '/worldCupActivity2018List',
    type: 'post',
    data:{
      token:token
    },
    dataType: 'json',
    success: function(res){
      if(res.code==0){
        var data = res;
				if (data.result[0] == undefined) {
				html = template('nullDetail', data);
				} else {
          // var len = data.result.length;
					// for (var i = 0; i < len; i++) {
					// 	data.result[i].addTime = myDate(res.result[i].addTime);
					// }
					html = template('allDetail', data);
				}
        $('.detail-content').html(html);
      }
    }
  })
}
// 猜中比赛数量
worldCupActivity2018CountWin();
// 猜中比赛数量
function worldCupActivity2018CountWin(){
  var	html = '';
  $.ajax({
    url: host + '/worldCupActivity2018CountWin',
    type: 'post',
    data:{
      token:token
    },
    dataType: 'json',
    success: function(res){
      if(res.code==0){
        var type = res.result.type;
        var finishedCount = res.result.winTimes;
        $('.finished-count').html(finishedCount);
        if(finishedCount>=5){
          $('.finish5').addClass('finished').html('达成');
        }
        if(finishedCount>=20){
          $('.finish20').addClass('finished').html('达成');
        }
        if(type==1) {
          $('.finish30').addClass('finished').html('名额已满');
        }else if(type==0){
          $('.finish30').html('未达成');
        }else if(type==2){
          $('.finish30').addClass('finished').html('达成');
        }
      }
    }
  })
}

// 将时间戳转为文字日期
function myDate(date) {
  var dates = new Date(parseInt(date)).toLocaleString('chinese', {hour12: false});
	var zz = dates.split('/');
	if (zz.length > 1) {
		dates = dates.replace(/\//g, "-");
	} else {
		dates=dates.split('年')[0]+ '-' + dates.split('年')[1].split('月')[0] + '-' + dates.split('年')[1].split('月')[1].split('日')[0] + dates.split('年')[1].split('月')[1].split('日')[1];
	}
	var time1 = dates.split(' ');
  var time2 = time1[0].split('-')[1] + '月' + time1[0].split('-')[2] + '日 ' + time1[1].split(':')[0] + ':' + time1[1].split(':')[1];
	dates = time2;
	return dates;
};
// 下注按钮
$('.vote-sub').click(function(){
  var amount  = $voteCount.val();
  $voteCount.val('');
  if(amount>0){
    worldCupActivity2018Betting(betting,amount,scheduleId);
  }

});
//
function siblingsBg(_this,voteBg,count){
  betting = count;
  scheduleId = _this.attr('data-scheduleId');
  _this.siblings('.team1-vote').css({backgroundImage: "url('./imgs/vote_bg_grey.png')",color:"#a94531"});
  _this.siblings('.team0-vote').css({backgroundImage: "url('./imgs/vote0_bg_grey.png')",color:"#a94531"});
  _this.siblings('.team2-vote').css({backgroundImage: "url('./imgs/vote_bg_grey.png')",color:"#a94531"});
  _this.css({backgroundImage: "url('./imgs/"+voteBg+".png')",color:"#fff"});
  worldCupActivity2018Detail(count,scheduleId,_this,'a');
}
// 弹出下注弹框
function voteBtnFn(id,myBetting){
  if(myBetting!=-1){
    betting = myBetting;
    scheduleId = id;
  }
  // 下注成功之后刷新页面
  $('.popin').css({display: 'none'});
  $('.votein').css({display: 'block'})
  $('.pop').css({display: 'block'});
}

// 竞猜记录部分
$('.record-btn').click(function() {
  worldCupActivity2018List();
  $('.popin').css({display: 'none'});
  $('.recordin').css({display: 'block'});
  $('.pop').css({display: 'block'});
});

// 功能弹框
$('.popbg,.close,.votein-close').click(function() {
  $('.pop').css({display: 'none'});
});
// 提示弹框
$('.popbg2').click(function() {
  $('.pop2').css({display: 'none'});
});
