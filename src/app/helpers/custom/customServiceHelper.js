const credentials = {
    AZURE_ACCOUNT_NAME: 'nuihsunbird',
    AZURE_ACCOUNT_KEY: 'PiAc4nsoLrcyfxqH2E4PEiNeEZ2Ji42LiyGKe698a46DAaOLEqS3CbS9gMzdYBQBIEjO+f0uIj9szZBvEosDVQ==',
    AZURE_STORAGE_URL: 'https://nuihsunbird.blob.core.windows.net/',
    EMAIL_STORE_CONTAINER_NAME: 'emails'
}

var azure = require('azure-storage');
var blobService = azure.createBlobService(credentials.AZURE_ACCOUNT_NAME, credentials.AZURE_ACCOUNT_KEY);

function verifyAndStoreEmail(req, res) {

    console.log(req.body)
    var email = req.body.emailid;
    console.log('email is : ' + email)
    verifyOrStoreEmail(email, function (err) {
        if (err) {
            console.log('error in uploading email blob to azure ! ' + JSON.stringify(err));
            //res.json({result: 'error in uploading email to azure ! '+JSON.stringify(err),success:false})
            res.status(500)
            res.send({
                'id': null,
                'ver': null,
                'ts': null,
                'params': {
                    'resmsgid': null,
                    'msgid': null,
                    'status': 'failed',
                    'err': '',
                    'errmsg': null
                },
                'responseCode': 500,
                'result': {}
            })
            res.end()
        } else {
            console.log('uploaded email blob successfully to azure');
            //res.json({success:true, result: 'uploaded email blob successfully to azure'})
            res.status(200)
            res.send({
                'id': null,
                'ver': null,
                'ts': null,
                'params': {
                    'resmsgid': null,
                    'msgid': null,
                    'status': 'success',
                    'err': '',
                    'errmsg': null
                },
                'responseCode': 'OK',
                'result': {}
            })
            res.end()
        }
    })
}

function verifyOrStoreEmail(email, callback) {

    blobService.createBlockBlobFromText(credentials.EMAIL_STORE_CONTAINER_NAME, email, email, function (error, result, response) {
        if (!error) {
            // file uploaded
            console.log('blob result ' + JSON.stringify(response));
            return callback(null);
        } else {
            console.log(error)
            return callback(error)
        }
    });
}

module.exports.verifyAndStoreEmail = verifyAndStoreEmail;