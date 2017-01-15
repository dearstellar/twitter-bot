
var TwitterPackage = require('twitter');

var StellarSdk = require('stellar-sdk');

var secret = {

	consumer_key: 'wevcn30cW0mpxXP17FTWZCjb9',
	consumer_secret: '1C8vRm8knCEoVRVP9rTX6kWpiab0FetndX2BBe1e9QQUM48UnC',
	access_token_key: '814073553230368768-x7L11XK7LCSa7yaMVU5RIZTwDZwNJp5',
	access_token_secret: 'vlUPGmYbBCYxT7F6mtxtABMDA3MQBal3jrnZTNMxfUUTX'

			}

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

		if (txtArr[1] !== "balance" || !StellarSdk.Keypair.isValidPublicKey(txtArr[2]) ) {
		// Tweet back correct syntax
		var errorMessage = "Hello @" + name + ". " + "We could not process your request. Please tweet in this format: @DearStellar balance YOUR-ACCOUNTID " + time; 

		//call the post function
		Twitter.post('statuses/update', {status: errorMessage}, function(error, tweetErrorReply, response) {

			//if we get an error print out
			if (error){
				console.log(error);
			}

			//print the text of the tweet we sent out
			console.log(tweetErrorReply.text);
		});


		}


		else {
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
		 			}
		 			else {
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


	
