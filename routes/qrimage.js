var express = require('express');
var router = express.Router();
var qr = require('qr-image');



router.get('/:address', function(req, res) {
    var address = req.params.address;

    var qr_png = qr.image(address, { type: 'png', ec_level: 'H' });
    res.set('Content-Type', 'image/png');
    qr_png.pipe(res);
});

router.get('/', function(req, res) {
    res.status(400).send('Ops, something went wrong! Did you forget to enter your address? --> https://api.stronghands.info/qrimage/(YOUR-ADDRESS)')
});

module.exports = router;