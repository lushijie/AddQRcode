const dbName = '__QR_DB__';
document.addEventListener('DOMContentLoaded', function () {
  // 浏览器环境
  var conn = {
    postMessage: function(data) {
      window.localStorage.setItem(dbName, JSON.stringify(data));
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

  // 绘制背景图
  function drawBackImage() {
    var store = readStore();
    if (!store.$qrbase64) return;
    return new Promise(function(resolve, reject) {
      var img = new Image();
      img.src = store.$qrbase64;
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        $('#preview1').attr('src', canvas.toDataURL('image/png'));
        $('#preview2').attr('src', canvas.toDataURL('image/png'));
        setTimeout(function() {
          drawFrontImage();
        }, 10);
      }
    });
  }

  // 绘制二维码
  function drawFrontImage() {
    var store = readStore();
    if (!store.$qrlink) return;
    var position = calcPosition(store);
    return new Promise(function(resolve, rejct) {
      QRCode.toDataURL(store.$qrlink, {
        width: store.$qrwidth,
        margin: 2
      }).then(dataURL => {
        var img2 = new Image();
        img2.src = dataURL;
        img2.setAttribute('crossOrigin','Anonymous');
        img2.onload = function() {
          ctx.drawImage(img2, position.x, position.y);
          $('#preview1').attr('src', canvas.toDataURL('image/png'));
        }
      });
    });
  }

  // 计算二维码位置
  function calcPosition() {
    var store = readStore();
    var pos = { x: 0, y: 0 };

    // 实际宽高
    const realBackImgWidth = $('#preview2').width();
    const realBackImgHeight = $('#preview2').height();
    const distance = store.$qrwidth + store.$qrmargin;

    switch (store.$qrpos) {
      case 1: // 左上角
        pos.x = store.$qrmargin;
        pos.y = store.$qrmargin;
      break;
      case 2: // 右上角
        pos.x = realBackImgWidth - distance;
        pos.y = store.$qrmargin;
      break;
      case 3: // 左下角
        pos.x = store.$qrmargin;
        pos.y = realBackImgHeight - distance;
      break;
      case 4: // 右下角
        pos.x = realBackImgWidth - distance;
        pos.y = realBackImgHeight - distance;
      break;
      case 5: // 居中
        pos.x = realBackImgWidth / 2 - +store.$qrwidth / 2;
        pos.y = realBackImgHeight / 2 - +store.$qrwidth / 2;
      break;
      case 6: // 自定义
        pos.x = store.$qrleft;
        pos.y = store.$qrtop;
      break;
    }

    return pos;
  }

  // 读 localstorage
  function readStore() {
    return JSON.parse(bg.localStorage.getItem(dbName) || '{}');
  }

  // 写 localstorage
  function updateStore() {
    store = readDom()
    conn.postMessage(store);
  }

  // 重置 dom
  function resetDom() {
    $('#qrfilepath').val('');
    $('#qrwidth').val(200);
    $('#qrmargin').val(40);
    $('#qrpos').val(4);
    $('#qrlink').val('');
    $('#preview').attr('src', '');
    $('#qrtop').val(0);
    $('#qrleft').val(0);
    $('#qrbase64').val('');
    $('#preview1').attr('src', '');
    $('#preview2').attr('src', '');
  }

  // 读 dom
  function readDom() {
    return {
      $qrbase64: $('#qrbase64').val() || '',
      $qrfilepath: $('#qrfilepath').val() || '',
      $qrlink : $('#qrlink').val() || '',
      $qrwidth : +$('#qrwidth').val(),
      $qrmargin : +$('#qrmargin').val() || 0,
      $qrpos : +$('#qrpos').val(),
      $qrleft: +$('#qrleft').val(),
      $qrtop: +$('#qrtop').val()
    };
  }

  // 写 dom
  function updateDom() {
    var store = readStore();
    $('#qrfilepath').val(store.$qrfilepath || '');
    $('#qrwidth').val(store.$qrwidth || 200);
    $('#qrmargin').val(+store.$qrmargin || 0);
    $('#qrpos').val(store.$qrpos || 4);
    $('#qrlink').val(store.$qrlink || '');
    $('#qrleft').val(+store.$qrleft || 0);
    $('#qrtop').val(+store.$qrtop || 0);
    $('#qrbase64').val(store.$qrbase64 || '');
  }

  function renderElement() {
    // 自定义显示左、右位置设定输入框
    $('.custom-pos-group')[+$('#qrpos').val() === 6 ? 'show' : 'hide']();

    // 居中、自定义显示二维码边距
    if ([5, 6].indexOf(+$('#qrpos').val()) > -1) {
      $('.qr-margin-group').hide();
    } else {
      $('.qr-margin-group').show();
    }
  }

  function bindEvent() {
    // 重置
    $('.btn-reset').click(function(evt) {
      evt.preventDefault();
      resetDom();

      // fix crx, 更新缓存
      setTimeout(function() {
        updateStore();
      }, 100);
    });

    // watch change
    $('#qrbase64, #qrpos, #qrlink, #qrwidth, #qrmargin, #qrleft, #qrtop').on('keyup change', function(e) {
      updateStore();
      renderElement();
      drawBackImage();
    });

    // 下载
    $('.btn-download').click(function(evt) {
      evt.preventDefault();
      var downloadURL = $('#preview1').attr('src');
      if (downloadURL) {
        var download = $('<a>')
          .attr('href', downloadURL)
          .attr('download', 'img.jpg')
          .appendTo('body');
        download[0].click();
        download.remove();
      }
    });

    // 上传文件
    $('.btn-upload').click(function(evt) {
      evt.preventDefault();
      $('#qrfile').click();
    });

    // watch
    $('#qrfile').change(function(evt) {
      if (evt.target.value) {
        $('#qrfilepath').val(evt.target.value);
      }
      var $qrfile = $('#qrfile').prop('files')[0];
      if ($qrfile) {
        var reader = new FileReader();
        reader.readAsDataURL($qrfile);
        reader.onload = function(e){
          $('#qrbase64').val(this.result);
          updateStore();
          setTimeout(function() {
            drawBackImage();
          }, 100);
        }
      } else if ($('#qrbase64').val()) {
        drawBackImage();
      }
    });
  }
  bindEvent();

  updateDom();
  renderElement();
  drawBackImage();
});
