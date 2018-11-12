var DEFAULT = {
  dbName: '__QR_DB__',
  qrText: '', // 二维码文案
  qrWidth: 100, // 二维码大小
  qrMargin: 40, // 二维码距离图片边沿的距离
  qrPosStyle: 4, // 二维码位置类型
  qrLeft: 0, // 二维码距离左侧距离
  qrTop: 0, // 二维码距离顶部距离

  scale: 1, // 当前缩放比例
  filePath: '', // 背景图文件地址
  backImage: '', // 背景图base64
  backImageWidth: -1, // 背景图初始宽度
  backImageHeight: -1, // 背景图初始高度
  frontImage: '', // scale 对应的二维码大小
  frontImageOrigin: '', // 实际二维码大小
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

          calcPosition(true);
        },
        enumerable: true
      },
      qrMargin: {
        get: function() {
          return +DATA.qrMargin;
        },
        set: function(value) {
          $('#qrMargin').val(value);
          DATA.qrMargin = +value;
          updateStorage(DATA);
          calcPosition(true);
        },
        enumerable: true
      },
      qrPosStyle: {
        get: function() {
          return +DATA.qrPosStyle;
        },
        set: function(value) {
          $('#qrPosStyle').val(+value);
          DATA.qrPosStyle = +value;

          $('.custom-pos-group')[+value === 6 ? 'show' : 'hide']();
          if ([5, 6].indexOf(+value) > -1) {
            $('.qr-margin-group').hide();
          } else {
            $('.qr-margin-group').show();
          }

          updateStorage(DATA);
          calcPosition(true);
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

          calcPosition(true);
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

          calcPosition(true);
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

  function calcPosition(isPreview) {
    var store = readStorage();
    var pos = { x: 0, y: 0 };

    var backImageWidth = store.backImageWidth;
    var backImageHeight = store.backImageHeight;
    var qrWidth = store.qrWidth;
    var qrMargin = store.qrMargin;
    var qrLeft = store.qrLeft;
    var qrTop = store.qrTop;

    // 预览
    if (isPreview) {
      qrWidth = store.scale * store.qrWidth;
      qrMargin = store.scale * store.qrMargin;

      backImageWidth = store.scale * store.backImageWidth;
      backImageHeight = store.scale * store.backImageHeight;

      qrLeft = store.scale * store.qrLeft;
      qrTop = store.scale * store.qrTop;
    }
    var distance = qrWidth + qrMargin;

    switch (+store.qrPosStyle) {
      case 1: // 左上角
        pos.x = qrMargin;
        pos.y = qrMargin;
      break;
      case 2: // 右上角
        pos.x = backImageWidth - distance;
        pos.y = qrMargin;
      break;
      case 3: // 左下角
        pos.x = qrMargin;
        pos.y = backImageHeight - distance;
      break;
      case 4: // 右下角
        pos.x = backImageWidth - distance;
        pos.y = backImageHeight - distance;
      break;
      case 5: // 居中
        pos.x = backImageWidth / 2 - +qrWidth / 2;
        pos.y = backImageHeight / 2 - +qrWidth / 2;
      break;
      case 6: // 自定义
        pos.x = qrLeft;
        pos.y =qrTop;
      break;
    }

    // 未上传图片时
    if (store.backImageHeight === -1) {
      pos = {
        x: 0,
        y: 0,
      }
    }

    // 预览css设置
    if (isPreview) {
      $('#frontImage').css({left: pos.x + 'px', top: pos.y + 'px'});
    }

    return pos;
  }

  // 构造二维码
  function genQrCode(qrWidth, qrText) {
    // 预览二维码
    QRCode.toDataURL(qrText, {
      width: +qrWidth * local.scale,
      margin: 2
    }).then(dataURL => {
      local.frontImage = dataURL;
      if (+local.scale === 1) {
        local.frontImageOrigin = dataURL;
      }
    });

    // 最终二维码
    if (+local.scale !== 1) {
      QRCode.toDataURL(qrText, {
        width: +qrWidth,
        margin: 2
      }).then(dataURL => {
        local.frontImageOrigin = dataURL;
      });
    }
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
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        setTimeout(function() {
          var img2 = new Image();
          img2.src = store.frontImageOrigin;
          img2.setAttribute('crossOrigin','Anonymous');
          img2.onload = function() {
            var pos = calcPosition();
            ctx.drawImage(img2, pos.x, pos.y);

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
        }, 10);
      }
    });

    // 上传文件
    $('.btn-upload').click(function(evt) {
      evt.preventDefault();
      $('#qrfile').click();
    });

    // 上传文件完成
    $('#qrfile').change(function(evt) {
      local.filePath = evt.target.value;

      var $qrfile = $('#qrfile').prop('files')[0];
      var reader = new FileReader();
      reader.readAsDataURL($qrfile);
      reader.onload = function(e){
        local.backImage = this.result;

        // wait load
        setTimeout(function() {
          local.scale = $('#backImage').width() / $('#backImageOrigin').width();
          local.backImageWidth = $('#backImageOrigin').width();
          local.backImageHeight = $('#backImageOrigin').height();
        }, 10);
      }
    });

    // 二维码链接变化重新生成二维码
    $('#qrText').on('keyup change', function(e) {
      local.qrText = e.target.value;
    });

    // 二维码
    $('#qrLeft, #qrTop, #qrMargin, #qrWidth').on('input', function(e) {
      local[$(e.target).attr('id')] = +e.target.value;
    });

    // 二维码位置
    $('#qrPosStyle').on('change', function(e) {
      // 首先将可能存在自定义位置重置
      local.qrTop = 0;
      local.qrLeft = 0;

      local.qrPosStyle = +e.target.value;
    });
  }

  // 事件绑定
  bindEvent();
});
