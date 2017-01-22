var firebase = require('firebase');
var app = null;
var _user = null;
var config = {
    apiKey: "AIzaSyDcPq_z9vh4CidkzFDyerRK0ZS7gs2Sj14",
    authDomain: "citytimer-90920.firebaseapp.com",
    databaseURL: "https://citytimer-90920.firebaseio.com",
    storageBucket: "citytimer-90920.appspot.com",
    messagingSenderId: "497040832817"
};

module.exports = function(context, mySbMsg) {
    if(!app) {
        context.log('Initializing Firebase App');
        app = firebase.initializeApp(config);
    }
    var defaultAuth = app.auth();
    if(!_user){
        defaultAuth.signInAnonymously()
                        .catch(function(error) {
                            context.log('Anonymous login failed: ' + error.message);
                            context.done();
                        });
    }

    defaultAuth.onAuthStateChanged(function(user) {
        if (user) {
            _user = user;
            context.log('User is signed in. user uid: ' + _user.uid);
            var defaultDatabase = app.database().ref().child('requests').child(_user.uid).child('userRequests');
            mySbMsg['userName'] = 'Anonymous';
            defaultDatabase.push(mySbMsg)
                            .then(function() {
                                context.log('JavaScript ServiceBus queue trigger function processed message', mySbMsg);
                                context.done();
                            })
                            .catch(function(error) {
                                context.log('Synchronization failed');
                                context.done();
                            });
        } else {
            context.log('User is signed out.');
            context.done();
        }
    });
};