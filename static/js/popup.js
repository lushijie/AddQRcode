document.addEventListener('DOMContentLoaded', function () {
  var conn = chrome.extension.connect({name: 'AddQRcode'});
  var bg = chrome.extension.getBackgroundPage();

  // 渲染图片
  // 更新缓存 + 绘制底图 + 绘制二维码
  function renderImage(base64Img) {
    refreshCache();
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = base64Img;
    img.onload = function () { // 绘制底图
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      $('#preview').attr('src', canvas.toDataURL('image/png'));

      var pos = {
        x: 0,
        y: 0
      };

      // 绘制二维码
      var storeData = getQrCodeData();
      if (!storeData.$qrlink) {
        return;
      }

      // $qrwidth 二维码尺寸
      // $qrmagin 二维码边距
      const distance = storeData.$qrwidth + storeData.$qrmargin;
      switch (storeData.$qrpos) {
        case 1: // 左上角
          pos.x = storeData.$qrmargin;
          pos.y = storeData.$qrmargin;
        break;
        case 2: // 右上角
          pos.x = canvas.width - distance;
          pos.y = storeData.$qrmargin;
        break;
        case 3: // 左下角
          pos.x = storeData.$qrmargin;
          pos.y = canvas.height - distance;
        break;
        case 4: // 右下角
          pos.x = canvas.width - distance;
          pos.y = canvas.height - distance;
        break;
        case 5: // 居中
          pos.x = canvas.width/2 - +storeData.$qrwidth/2;
          pos.y = canvas.height/2 - +storeData.$qrwidth/2;
        break;
        case 6: // 自定义
          pos.x = storeData.$qrleft;
          pos.y = storeData.$qrtop;
        break;
      }

      QRCode.toDataURL(storeData.$qrlink, { // 生成二维码
        width: storeData.$qrwidth,
        margin: 2
      }).then(dataURL => {  // 绘制二维码到canvas
        var img2 = new Image();
        img2.src = dataURL;
        img2.setAttribute('crossOrigin','Anonymous');
        img2.onload = function() {
          ctx.drawImage(img2, pos.x, pos.y);
          $('#preview').attr('src', canvas.toDataURL('image/png'));
        }
      });
    }
  }

  // 获取要缓存的数据
  function getQrCodeData() {
    return {
      $qrbase64: $('#qrbase64').val() || '',
      $qrfilepath: $('#qrfilepath').val() || '',
      $qrwidth : +$('#qrwidth').val() || 200,
      $qrmargin : +$('#qrmargin').val() || 40,
      $qrpos : +$('#qrpos').val() || 4,
      $qrlink : $('#qrlink').val() || '',
      $qrleft: +$('#qrleft').val() || 0,
      $qrtop: +$('#qrtop').val() || 0
    };
  }

  // 重置数据
  function resetQrCodeData() {
    $('#qrfilepath').val('');
    $('#qrwidth').val(200);
    $('#qrmargin').val(40);
    $('#qrpos').val(4);
    $('#qrlink').val('');
    $('#preview').attr('src', '');
    $('#qrtop').val(0);
    $('#qrleft').val(0);
    $('#qrbase64').val('');
  }

  // 更新缓存
  function refreshCache() {
    conn.postMessage(getQrCodeData());
  }

  // 渲染
  function run() {
    var $qrfilewrap = $('#qrfilewrap').prop('files')[0];
    if ($qrfilewrap) {
      var reader = new FileReader();
      reader.readAsDataURL($qrfilewrap);
      reader.onload = function(e){
        $('#qrbase64').val(this.result);
        renderImage(this.result);
      }
    } else if ($('#qrbase64').val()) {
      renderImage($('#qrbase64').val());
    }
  }

  // 从缓存中读取内容
  var store = JSON.parse(bg.localStorage.getItem('__QrCodeDb__') || '{}');
  $('#qrfilepath').val(store.$qrfilepath);
  $('#qrwidth').val(store.$qrwidth || 200);
  $('#qrmargin').val(store.$qrmargin  || 40);
  $('#qrpos').val(store.$qrpos || 4);
  $('#qrlink').val(store.$qrlink || '');
  $('#qrleft').val(store.$qrleft || 0);
  $('#qrtop').val(store.$qrtop || 0);
  $('#qrbase64').val(store.$qrbase64 || '');
  $('.custom-pos-group')[+$('#qrpos').val() === 6 ? 'show' : 'hide']();
  if ([5, 6].indexOf(+$('#qrpos').val()) > -1) {
    $('.qr-margin-group').hide();
  } else {
    $('.qr-margin-group').show();
  }

  if (store.$qrbase64) {
    renderImage(store.$qrbase64);
  }

  // 上传文件
  $('.btn-upload').click(function(evt) {
    evt.preventDefault();
    $('#qrfilewrap').click();
  });

  // 重置
  $('.btn-reset').click(function(evt) {
    evt.preventDefault();
    resetQrCodeData();

    // 更新缓存
    setTimeout(function() {
      refreshCache();
    }, 100);
  });

  // 上传完成
  $('#qrfilewrap').change(function(evt) {
    if (evt.target.value) {
      $('#qrfilepath').val(evt.target.value);
    }
  });

  // 下载
  $('.btn-download').click(function(evt) {
    evt.preventDefault();
    var downloadURL = $('#preview').attr('src');
    if (downloadURL) {
      var download = $('<a>')
        .attr('href', downloadURL)
        .attr('download', 'img.jpg')
        .appendTo('body');
      download[0].click();
      download.remove();
    }
  });

  // watch
  $('#qrfilewrap, #qrpos, #qrwidth, #qrmargin, #qrleft, #qrtop').change(function(evt) {
    $('.custom-pos-group')[+$('#qrpos').val() === 6 ? 'show' : 'hide']();
    $('.qr-margin-group')[+$('#qrpos').val() === 6 ? 'hide' : 'show']();
    run();
  });

  // watch
  $('#qrlink, #qrwidth, #qrmargin, #qrleft, #qrtop').keyup(function(evt) {
    run();
  });
});
