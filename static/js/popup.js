document.addEventListener('DOMContentLoaded', function () {
  var conn = chrome.extension.connect({name: 'AddQRcode'});
  var bg = chrome.extension.getBackgroundPage();
  var $base64img = '';

  // 从缓存中读取内容
  var __DB__ = JSON.parse(bg.localStorage.getItem('__QrCodeDb__') || '{}');
  if (__DB__.action === 'store') {
    $('#qrfileinput').val(__DB__.$qrfileinput);
    $('#qrwidth').val(__DB__.$qrwidth) || 200;
    $('#qrmargin').val(__DB__.$qrmargin) || 40;
    $('#qrpos').val(__DB__.$qrpos) || 4;
    $('#qrlink').val(__DB__.$qrlink);
    $('#qrleft').val(__DB__.$qrleft);
    $('#qrtop').val(__DB__.$qrtop);
    $('.custom-pos-group')[+$('#qrpos').val() === 6 ? 'show' : 'hide']();
    $('.qr-margin-group')[+$('#qrpos').val() === 6 ? 'hide' : 'show']();

    // 恢复图片
    if (__DB__.$base64img) {
      $base64img = __DB__.$base64img;
      renderImage(__DB__.$base64img);
    }
  }

  // 渲染图片
  function renderImage(result) {
    // 更新缓存
    refreshCache();

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = result;
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
      var storeData = getStoreData();
      // $qrlink 二维码链接
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

  // 渲染
  function render() {
    var $qrfile = $('#qrfile').prop('files')[0];
    if ($qrfile) {
      var reader = new FileReader();
      reader.readAsDataURL($qrfile);
      reader.onload = function(e){
        $base64img = this.result;
        renderImage(this.result);
      }
    } else if ($base64img) {
      renderImage($base64img);
    }
  }

  // 获取要缓存的数据
  function getStoreData(action) {
    return {
      action: action || 'store',
      $base64img: $base64img || '',
      $qrfileinput: $('#qrfileinput').val() || '',
      $qrwidth : +$('#qrwidth').val() || 200,
      $qrmargin : +$('#qrmargin').val() || 40,
      $qrpos : +$('#qrpos').val() || 4,
      $qrlink : $('#qrlink').val() || '',
      $qrleft: $('#qrleft').val() || 0,
      $qrtop: $('#qrtop').val() || 0
    };
  }

  // 更新缓存
  function refreshCache(action) {
    conn.postMessage(getStoreData(action));
  }

  // 上传文件
  $('.btn-upload').click(function(evt) {
    evt.preventDefault();
    $('#qrfile').click();
  });

  // 重置
  $('.btn-reset').click(function(evt) {
    evt.preventDefault();

    // reset
    $('#qrfileinput').val('');
    $('#qrwidth').val(200);
    $('#qrmargin').val(40);
    $('#qrpos').val(4);
    $('#qrlink').val('');
    $('#preview').attr('src', '');
    $('#qrtop').val(0);
    $('#qrleft').val(0);
    $base64img = '';

    // 更新缓存
    setTimeout(function() {
      refreshCache();
    }, 100);
  });

  // 上传完成
  $('#qrfile').change(function(evt) {
    if (evt.target.value) {
      $('#qrfileinput').val(evt.target.value);
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
  $('#qrfile, #qrpos, #qrwidth, #qrmargin, #qrleft, #qrtop').change(function(evt) {
    $('.custom-pos-group')[+$('#qrpos').val() === 6 ? 'show' : 'hide']();
    $('.qr-margin-group')[+$('#qrpos').val() === 6 ? 'hide' : 'show']();
    render();
  });

  // watch
  $('#qrlink, #qrwidth, #qrmargin, #qrleft, #qrtop').keyup(function(evt) {
    render();
  });
});
