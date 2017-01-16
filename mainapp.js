
var TwitterPackage = require('twitter');
 
var StellarSdk = require('stellar-sdk');
 
var secret = {
            consumer_key: 'XXX',
            consumer_secret: 'XXX',
            access_token_key: 'XXX',
            access_token_secret: 'XXX'
        };
 
var Twitter = new TwitterPackage(secret);
 
Twitter.stream('statuses/filter', {track: '@DearStellar'}, function(stream) {
 
    // when we get tweet data
    stream.on('data', function(tweet) {
 
        //who sent the tweet? (handle)
        var name = tweet.user.screen_name;
 
        //what is the text?
        var txt = tweet.text;
        var txtArr = txt.split(" ");
        var date = new Date();
        var time = date.getTime();
 
        console.log("name", name);
        console.log("text", txt);
 
        if (txtArr[1] !== "balance" || !StellarSdk.Keypair.isValidPublicKey(txtArr[2]) ) {
            // Tweet back correct syntax
            var errorMessage = "Hello @" + name + ". " + "We could not process your request. Please tweet in this format: @DearStellar balance YOUR-ACCOUNTID " + time;
 
            if (name !== "DearStellar") {
                console.log("Tweet not from DearStellar - Send error message");
                //call the post function
                Twitter.post('statuses/update', {status: errorMessage}, function(error, tweetErrorReply, response) {
 
                    //if we get an error print out
                    if (error){
                        console.log(error);
                    }
 
                    //print the text of the tweet we sent out
                    console.log(tweetErrorReply.text);
                });
            }else {
                console.log("Tweet from DearStellar - DONT Send error message");
                return;
               
                }
        }   else {
        // Tweet back responsse and DM
   
            var accountNumber = txtArr[2];
 
            var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
 
            server.accounts()
              .accountId(accountNumber)
              .call()
              .then(function (accountResult) {
                //console.log(accountResult);
                console.log('accountResult: ',accountResult);
                    var balances = "";
                    accountResult.balances.forEach(function(balance) {
                        var asset = "";
                        if (balance.asset_type === 'native') {
                        asset = 'Asset Code: XLM';
                        }   else {
                        asset = 'Asset Code: '+balance.asset_code+"\nAsset Issuer: "+balance.asset_issuer;
                    }
                        balances +="Amount: "+balance.balance+"\n"+asset+"\n-------\n";
                    });
               
                    // reply string
                    var reply = "Hi @" + name + ". " + "Your account balance has been sent to your dm. " + time;
 
                    //call the post function
                    Twitter.post('statuses/update', {status: reply}, function(error, tweetReply, response) {
           
                            //if we get an error print out
                            if (error){            
                                console.log(error);
                            }
                           
                            //print the text of the tweet we sent out
                            console.log(tweetReply.text);
                   
                    });
 
                    var dm = "Hi @" + name + ". " + "Your account balance is " + balances + time;
 
                    Twitter.post('direct_messages/new', {text: dm, screen_name: name}, function(error, sendDm, response) {
 
                        if (error){
                            console.log(error);
                        }
 
                        console.log(sendDm.text);
                    });
       
                });
       
        }
 
 
    });
 
 
    stream.on('error', function(error) {
 
        //print out the error
        console.log(error);
       
    });
 
});

	
