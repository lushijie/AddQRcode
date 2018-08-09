document.addEventListener('DOMContentLoaded', function () {
  function renderImage() {
    var qrinfo = {
      image: $('#imagefile').prop('files')[0],
      link: $('#qrlink').val(),
      pos: +$('#qrpos').val() || 4,
      width: +$('#qrwidth').val() || 200,
      margin: +$('#qrmargin').val(),
      padding: 2
    }

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var reader = new FileReader();
    reader.readAsDataURL(qrinfo.image);
    reader.onload = function(e){
      var img = new Image();
      img.src = this.result;
      img.onload = function () { // 绘制底图
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        var pos = {
          x: 0,
          y: 0
        }

        const distance = qrinfo.width + qrinfo.margin;
        switch (qrinfo.pos) {
          case 1:
            pos.x = qrinfo.margin;
            pos.y = qrinfo.margin;
          break;
          case 2:
            pos.x = canvas.width - distance;
            pos.y = qrinfo.margin;
          break;
          case 3:
            pos.x = qrinfo.margin;
            pos.y = canvas.height - distance;
          break;
          case 4:
            pos.x = canvas.width - distance;
            pos.y = canvas.height - distance;
          break;
          case 5:
            pos.x = canvas.width/2 - qrinfo.width/2;
            pos.y = canvas.height/2 - qrinfo.width/2;
          break;
        }

        QRCode.toDataURL(qrinfo.link, { // 生成二维码
          width: qrinfo.width,
          margin: qrinfo.padding
        }).then(dataURL => {  // 绘制二维码到canvas
          var img2 = new Image();
          img2.src = dataURL;
          img2.setAttribute('class', 'preload-img');
          img2.setAttribute('crossOrigin','Anonymous');
          img2.onload = function() {
            ctx.drawImage(img2, pos.x, pos.y);
            $('#preview').attr('src', canvas.toDataURL('image/png'));
          }
        });
      }
    }
  }

  $('.btn-upload').click(function(evt) {
    evt.preventDefault();
    $('#imagefile').click();
  });

  $('#imagefile').change(function(evt) {
    if (evt.target.value) {
      $('#imageinput').val(evt.target.value);
    }
  });

  $('.btn-merge').click(function(evt) {
    evt.preventDefault();
    renderImage();
  });

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
});
