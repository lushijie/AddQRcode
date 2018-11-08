document.addEventListener('DOMContentLoaded', function () {
  // 浏览器环境
  var conn = {
    postMessage: function(data) {
      window.localStorage.setItem('__QrCodeDb__', JSON.stringify(data));
    }
  };
  var bg = window;

  // chrome 插件环境
  if (window.AppView) {
    conn = chrome.extension.connect({name: 'AddQRcode'});
    bg = chrome.extension.getBackgroundPage();
  }

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  // 渲染底图
  function drawBgImage(base64Img) {
    // 更新缓存
    refreshCache();

    var img = new Image();
    img.src = base64Img || $('#qrbase64').val();
    img.onload = function () { // 绘制底图
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      $('#preview').attr('src', canvas.toDataURL('image/png'));
      // drawQrImage();
    }
  }

  // 计算二维码位置
  function caclPos(storeData) {
    var pos = { x: 0, y: 0 };
    const distance = storeData.$qrwidth + storeData.$qrmargin;
    const imgWidth = $('#preview').width();
    const imgHeight = $('#preview').height();
    switch (storeData.$qrpos) {
      case 1: // 左上角
        pos.x = storeData.$qrmargin;
        pos.y = storeData.$qrmargin;
      break;
      case 2: // 右上角
        pos.x = imgWidth - distance;
        pos.y = storeData.$qrmargin;
      break;
      case 3: // 左下角
        pos.x = storeData.$qrmargin;
        pos.y = imgHeight - distance;
      break;
      case 4: // 右下角
        pos.x = imgWidth - distance;
        pos.y = imgHeight - distance;
      break;
      case 5: // 居中
        pos.x = imgWidth / 2 - +storeData.$qrwidth / 2;
        pos.y = imgHeight / 2 - +storeData.$qrwidth / 2;
      break;
      case 6: // 自定义
        pos.x = storeData.$qrleft;
        pos.y = storeData.$qrtop;
      break;
    }
    return pos;
  }

  // 渲染二维码
  function drawQrImage(linkText, qrSize, position) {
    // 生成二维码并绘制
    QRCode.toDataURL(linkText, {
      width: qrSize,
      margin: 2
    }).then(dataURL => {
      var img2 = new Image();
      img2.src = dataURL;
      img2.setAttribute('crossOrigin','Anonymous');
      img2.onload = function() {
        ctx.drawImage(img2, position.x, position.y);
        $('#preview').attr('src', canvas.toDataURL('image/png'));
      }
    });
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
  function renderFromFile() {
    var $qrfilewrap = $('#qrfilewrap').prop('files')[0];
    if ($qrfilewrap) {
      var reader = new FileReader();
      reader.readAsDataURL($qrfilewrap);
      reader.onload = function(e){
        $('#qrbase64').val(this.result);
        drawBgImage(this.result);
      }
    } else if ($('#qrbase64').val()) {
      drawBgImage($('#qrbase64').val());
    }
  }

  // 根据 store 设置页面上的元素值
  function setDomValue(store) {
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
  }

  // 从缓存中读取内容
  var store = JSON.parse(bg.localStorage.getItem('__QrCodeDb__') || '{}');
  setDomValue(store);
  if (store.$qrbase64) {
    drawBgImage(store.$qrbase64);
  }
  if (store.$qrlink) {
    drawQrImage(store.$qrlink, store.$qrwidth, caclPos(store));
  }



  // -------- event ---------
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
  $('#qrpos').change(function(evt) {
    $('.custom-pos-group')[+$('#qrpos').val() === 6 ? 'show' : 'hide']();
    $('.qr-margin-group')[+$('#qrpos').val() === 6 ? 'hide' : 'show']();
  });

  // watch
  $('#qrfilewrap').change(function(evt) {
    renderFromFile();
  });

  // watch
  $('#qrpos, #qrwidth, #qrmargin, #qrleft, #qrtop').change(function(evt) {
    drawBgImage();
  });

  // watch
  $('#qrwidth, #qrmargin, #qrleft, #qrtop').keyup(function(evt) {
    // drawQrImage();
  });

  // $('#qrlink').on('keyup change', function(e) {
  //   var storeData = getQrCodeData();
  //   if (storeData.$qrlink) {
  //     QRCode.toDataURL(storeData.$qrlink, { // 生成二维码
  //       width: storeData.$qrwidth,
  //       margin: 2
  //     }).then(dataURL => {  // 绘制二维码到canvas
  //       qrLink = dataURL;
  //       drawQrImage();
  //     });
  //   }
  // });
});
