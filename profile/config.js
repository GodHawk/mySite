/**
 * Created by william on 15-7-14.
 */
exports.mongoDebugMode = true;

exports.mongoDbConfig = {
    url    : 'mongodb://localhost:27017/mysite',
    options: {
        db    : {native_parser: true},
        server: {
            poolSize      : 5,
            auto_reconnect: true,
            socketOptions : {
                keepAlive: 1
            }
        },
        //replset: { rs_name: 'myReplicaSetName' },
        user  : 'root',
        pass  : ''
    }
};