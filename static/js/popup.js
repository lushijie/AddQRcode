var DEFAULT = {
  dbName: '__QR_DB__',
  scale: 1,
  qrText: '',
  qrWidth: 100,
  qrMargin: 40,
  qrPosStyle: 4,
  qrLeft: 0,
  qrTop: 0,

  filePath: '',
  backImage: '',
  backImageWidth: -1,
  backImageHeight: -1,
  frontImage: '',
  frontImageOrigin: '',
}

document.addEventListener('DOMContentLoaded', function () {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  // 浏览器环境
  var conn = {
    postMessage: function(data) {
      window.localStorage.setItem(DEFAULT.dbName, JSON.stringify(data));
    }
  };
  var bg = window;

  // chrome 插件环境
  if (window.AppView) {
    conn = chrome.extension.connect({name: 'AddQRcode'});
    bg = chrome.extension.getBackgroundPage();
  }

  // 读 localStorage
  function readStorage() {
    return JSON.parse(bg.localStorage.getItem(DEFAULT.dbName) || JSON.stringify(DEFAULT));
  }

  // 写 localStorage
  function updateStorage(store) {
    conn.postMessage(store);
  }

  function LocalData(DATA) {
    Object.defineProperties(this, {
      scale: {
        get: function() {
          return DATA.scale;
        },
        set: function(value) {
          DATA.scale = value;
          updateStorage(DATA);
        },
        enumerable: true
      },
      dbName: {
        get: function() {
          return DATA.dbName;
        },
        set: function() {
          // todo
        },
        enumerable: true
      },
      filePath: {
        get: function() {
          return DATA.filePath || '';
        },
        set: function(value) {
          DATA.filePath = value;
          $('#filePath').val(value);
          updateStorage(DATA);
        },
        enumerable: true
      },
      qrText: {
        get: function() {
          return DATA.qrText || '';
        },
        set: function(value) {
          $('#qrText').val(value);
          DATA.qrText = value;
          updateStorage(DATA);
          if (!value) {
            $('#frontImage').attr('src', '');
            return;
          }
          genQrCode(DATA.qrWidth, value);
        },
        enumerable: true
      },
      qrWidth: {
        get: function() {
          return +DATA.qrWidth;
        },
        set: function(value) {
          if (+DATA.backImageHeight != -1) {
            value = Math.min(+DATA.backImageWidth, +DATA.backImageHeight, value);
          }
          $('#qrWidth').val(value);
          DATA.qrWidth = value;
          updateStorage(DATA);
          if (DATA.qrText) {
            genQrCode(value, DATA.qrText);
          }
        },
        enumerable: true
      },
      qrMargin: {
        get: function() {
          return +DATA.qrMargin;
        },
        set: function(value) {
          $('#qrMargin').val(value);
          DATA.qrMargin = value;
          updateStorage(DATA);
        },
        enumerable: true
      },
      qrPosStyle: {
        get: function() {
          return +DATA.qrPosStyle;
        },
        set: function(value) {
          $('#qrPosStyle').val(value);
          DATA.qrPosStyle = value;

          $('.custom-pos-group')[+value === 6 ? 'show' : 'hide']();
          if ([5, 6].indexOf(+value) > -1) {
            $('.qr-margin-group').hide();
          } else {
            $('.qr-margin-group').show();
          }

          updateStorage(DATA);
        },
        enumerable: true
      },
      qrLeft: {
        get: function() {
          return +DATA.qrLeft;
        },
        set: function(value) {
          $('#qrLeft').val(value);
          DATA.qrLeft = value;
          updateStorage(DATA);
        },
        enumerable: true
      },
      qrTop: {
        get: function() {
          return +DATA.qrTop;
        },
        set: function(value) {
          $('#qrTop').val(value);
          DATA.qrTop = value;
          updateStorage(DATA);
        },
        enumerable: true
      },
      backImage: {
        get: function() {
          return DATA.backImage || '';
        },
        set: function(value) {
          $('#backImage').attr('src', value);
          $('#backImageOrigin').attr('src', value);
          DATA.backImage = value;
          updateStorage(DATA);
        },
        enumerable: true
      },
      backImageWidth: {
        get: function() {
          return DATA.backImageWidth;
        },
        set: function(value) {
          DATA.backImageWidth = value;
          updateStorage(DATA);
        },
        enumerable: true
      },
      backImageHeight: {
        get: function() {
          return DATA.backImageHeight;
        },
        set: function(value) {
          DATA.backImageHeight = value;
          updateStorage(DATA);
        },
        enumerable: true
      },
      frontImage: {
        get: function() {
          return DATA.frontImage || '';
        },
        set: function(value) {
          $('#frontImage').attr('src', value);
          DATA.frontImage = value;
          updateStorage(DATA);
        },
        enumerable: true
      },
      frontImageOrigin: {
        get: function() {
          return DATA.frontImageOrigin || '';
        },
        set: function(value) {
          $('#frontImageOrigin').attr('src', value);
          DATA.frontImageOrigin = value;
          updateStorage(DATA);
        },
        enumerable: true
      },
    });
  }

  window.local = new LocalData(Object.assign({}, DEFAULT, readStorage()));
  Object.keys(readStorage()).forEach(function(key) {
    local[key] = readStorage()[key];
  });

  // 计算二维码虚拟位置
  function calcPosition() {
    var pos = { x: 0, y: 0 };

    // 实际宽高
    const realBackImgWidth = DATA.backImageWidth;
    const realBackImgHeight = DATA.backImageHeight;
    const qrWidth = DATA.scale * DATA.qrWidth;
    const qrMargin = DATA.scale * DATA.qrMargin;
    const distance = qrWidth + qrMargin;

    switch (DATA.qrPosStyle) {
      case 1: // 左上角
        pos.x = qrMargin;
        pos.y = qrMargin;
      break;
      case 2: // 右上角
        pos.x = realBackImgWidth - distance;
        pos.y = qrMargin;
      break;
      case 3: // 左下角
        pos.x = qrMargin;
        pos.y = realBackImgHeight - distance;
      break;
      case 4: // 右下角
        pos.x = realBackImgWidth - distance;
        pos.y = realBackImgHeight - distance;
      break;
      case 5: // 居中
        pos.x = realBackImgWidth / 2 - +qrWidth / 2;
        pos.y = realBackImgHeight / 2 - +qrWidth / 2;
      break;
      case 6: // 自定义
        pos.x = DATA.qrLeft;
        pos.y = DATA.qrTop;
      break;
    }

    return {
      x: Math.min(DATA.scale * pos.x, DATA.scale * realBackImgWidth - distance),
      y: Math.min(DATA.scale * pos.y, DATA.scale * realBackImgHeight - distance)
    }
  }

  // 构造二维码
  function genQrCode(qrWidth, qrText) {
    QRCode.toDataURL(qrText, {
      width: +qrWidth * local.scale,
      margin: 2
    }).then(dataURL => {
      local.frontImage = dataURL;
    });

    QRCode.toDataURL(qrText, {
      width: +qrWidth,
      margin: 2
    }).then(dataURL => {
      local.frontImageOrigin = dataURL;
    });
  }

  // 注册事件
  function bindEvent() {
    // 重置
    $('.btn-reset').click(function(evt) {
      evt.preventDefault();

      // fix crx 滞后 bug
      setTimeout(function() {
        Object.keys(DEFAULT).forEach(function(key) {
          local[key] = DEFAULT[key];
        });
      }, 50);
    });

    // 下载
    $('.btn-download').click(function(evt) {
      evt.preventDefault();
      var store = readStorage();

      var img = new Image();
      img.src = store.backImage;
      img.onload = function () {
        canvas.width = store.backImageWidth;
        canvas.height = store.backImageHeight;
        ctx.drawImage(img, 0, 0, store.backImageWidth, store.backImageHeight);

        setTimeout(function() {
          var img2 = new Image();
          img2.src = store.frontImageOrigin;
          img2.setAttribute('crossOrigin','Anonymous');
          img2.onload = function() {
            ctx.drawImage(img2, store.qrLeft, store.qrTop);

            $('#downloadImage').attr('src', canvas.toDataURL('image/png'));
            var downloadURL = $('#downloadImage').attr('src');
            if (downloadURL) {
              var download = $('<a>')
                .attr('href', downloadURL)
                .attr('download', 'img.jpg')
                .appendTo('body');
              download[0].click();
              download.remove();
            }
          }
        }, 30);
      }
    });

    // 上传文件
    $('.btn-upload').click(function(evt) {
      evt.preventDefault();
      $('#qrfile').click();
    });

    // 上传文件完成
    $('#qrfile').change(function(evt) {
      if (evt.target.value) {
        local.filePath = evt.target.value;
      }
      var $qrfile = $('#qrfile').prop('files')[0];
      if ($qrfile) {
        var reader = new FileReader();
        reader.readAsDataURL($qrfile);
        reader.onload = function(e){
          local.backImage = this.result;
          setTimeout(function() {
            local.scale = $('#backImage').width() / $('#backImageOrigin').width();
            local.backImageWidth = $('#backImageOrigin').width();
            local.backImageHeight = $('#backImageOrigin').height();
          }, 10);
        }
      }
    });

    // 二维码链接变化重新生成二维码
    $('#qrText').on('keyup change', function(e) {
      local.qrText = e.target.value;
    });

    // 二维码
    $('#qrLeft, #qrTop, #qrMargin, #qrWidth').on('input', function(e) {
      local[$(e.target).attr('id')] = e.target.value;
    });

    // 二维码位置
    $('#qrPosStyle').on('change', function(e) {
      local.qrPosStyle = e.target.value;
    });
  }

  // 事件绑定
  bindEvent();
});
