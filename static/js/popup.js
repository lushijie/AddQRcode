document.addEventListener('DOMContentLoaded', function () {
  var conn = chrome.extension.connect({name: 'AddQRcode'});
  var bg = chrome.extension.getBackgroundPage();
  var $base64img = '';

  // 从缓存中读取内容
  var __DB__ = JSON.parse(bg.localStorage.getItem('__DB__') || '{}');
  if (__DB__.action === 'store') {
    $('#qrfileinput').val(__DB__.$qrfileinput);
    $('#qrwidth').val(__DB__.$qrwidth) || 200;
    $('#qrmargin').val(__DB__.$qrmargin) || 40;
    $('#qrpos').val(__DB__.$qrpos) || 4;
    $('#qrlink').val(__DB__.$qrlink);

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

      // 绘制二维码
      var storeData = getStoreData();
      if (!storeData.$qrlink) {
        return;
      }

      var pos = {
        x: 0,
        y: 0
      };
      const distance = storeData.$qrwidth + storeData.$qrmargin;
      switch (storeData.$qrpos) {
        case 1:
          pos.x = storeData.$qrmargin;
          pos.y = storeData.$qrmargin;
        break;
        case 2:
          pos.x = canvas.width - distance;
          pos.y = storeData.$qrmargin;
        break;
        case 3:
          pos.x = storeData.$qrmargin;
          pos.y = canvas.height - distance;
        break;
        case 4:
          pos.x = canvas.width - distance;
          pos.y = canvas.height - distance;
        break;
        case 5:
          pos.x = canvas.width/2 - +storeData.$qrwidth/2;
          pos.y = canvas.height/2 - +storeData.$qrwidth/2;
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
      $qrlink : $('#qrlink').val() || ''
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
  $('#qrfile, #qrpos, #qrwidth, #qrmargin').change(function(evt) {
    render();
  });

  // watch
  $('#qrlink, #qrwidth, #qrmargin').keyup(function(evt) {
    render();
  });
});
