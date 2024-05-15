const { connect } = require('mongoose');
const User = require("../models/userModel");
const Stripe = require("../models/stripeModel");
const Event = require("../models/eventModel")
const Ticket = require("../models/ticketModel")

//creating session

const createSession = async (req, res) => {
  console.log("creating session")

  console.log("creating account session!!")
  const userId = req.decoded.id;
    const stripeDetails = await Stripe.findOne({userId: userId})
    console.log(stripeDetails)

    if (!stripeDetails) {
      return res.status(403).json({ message: "User not found" });
    }
    
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  try {
    const accountSession = await stripe.accountSessions.create({
      account: stripeDetails.stripeAccountId,
      components: {
        payments: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
          }
        },
        account_onboarding: {
          enabled: true,
          features: {
            external_account_collection: false,

            

          },
          
        },
        account_management: {
          enabled: true,
          features: {
            external_account_collection: false,
          },
        },
      
        payments: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
            destination_on_behalf_of_charge_management: true,
          },
        },
        payment_details: {
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
            destination_on_behalf_of_charge_management: true,
          },
        },
        balances: {
          enabled: true,
          features: {
            instant_payouts: true,
            standard_payouts: true,
            edit_payout_schedule: true,
          },
        },
        notification_banner: {
          enabled: true,
          features: {
            external_account_collection: false,
          },
        },
      }
    });
    console.log("account session: ",accountSession)

    res.json({
      client_secret: accountSession.client_secret,
    });
  } catch (error) {
    console.error('An error occurred when calling the Stripe API to create an account session', error);
    res.status(500);
    res.send({error: error.message});
  }
}


//
const checkout =  async (req, res) => {
  console.log("checking out")
  const eventId = req.params.eventId;
  console.log("eventId: ",eventId);
  try{
    const event = await Event.findById(eventId).exec();
    console.log("event: ",event);
    if(!event){
      return res.status(400).json({message: "Event not found"})
      
    }
     // Extracting user ID from the decoded token
     const userId = req.decoded.id;
     console.log("seller Id: ",event.createdBy)
    const user = await User.findById(userId).exec();
    const sellerId = event.createdBy

     const connectedAccount = await Stripe.find({userId: sellerId}).exec()
     console.log("connec account: ",connectedAccount)
     if(!connectedAccount){
      return res.status(400).json({message: "Seller has no connected account"})
     }

     // Extracting event information from the request body
     
     // Check if the event exists
    
 
     if (!event) {
       return res.status(404).json({ message: "Event not found" });
     }
 
     // Check if the event has available seats
     // Add additional validation logic as needed
     if (event.availableSeats <= 0) {
       return res
         .status(400)
         .json({ message: "No available seats for the event" });
     }
     // Check if the user has already purchased a ticket for the event
     const existingTicket = await Ticket.findOne({ userId, eventId });
     
     if (existingTicket) {
      console.log("already bought ticket")
       return res.status(400).json({
         message: "You has already purchased a ticket for this event",
       });
     }
     console.log("createing payment intent")
    // Create a PaymentIntent with the order amount and currency
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log("connected account: ",connectedAccount[0].stripeAccountId)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: event.ticketPrice * 100,
    currency: "usd",
    description: event.title,
    // shipping: {

    //   name: 'Jenny Rosen',
    //   address: {
    //     line1: '510 Townsend St',
    //     postal_code: '98140',
    //     city: 'San Francisco',
    //     state: 'CA',
    //     country: 'US',
    //   },
     
    // },
    
    receipt_email: user.email,

    transfer_data: {
        destination: connectedAccount[0].stripeAccountId,
      },
     
      on_behalf_of: connectedAccount[0].stripeAccountId,
     
    
      automatic_payment_methods: {
        enabled: true,
      },
  });
  console.log("payment intent id: ",paymentIntent)
  

  // // Update the available seats for the event
  // await Event.findByIdAndUpdate(eventId, {
  //   $inc: { availableSeats: -1 }, // Decrease available seats by 1
  // });
  console.log("paymentIntent: ",paymentIntent)

  res.send({
    paymentIntent: paymentIntent,
    clientSecret: paymentIntent.client_secret,

  });
  }catch(e){
    console.log("server error: ",e)
    return res.status(500).json({message: "An server error occured! Please try again!"})
  }
  
}

//connect account
const connectAccount =  async (req, res) => {
  const userId = req.decoded.id;
  console.log(userId)
  
  const existingAccount = await Stripe.findOne({ userId: userId});
  console.log("existing acount: ",existingAccount)
  if(existingAccount){
      return res.status(400).json({status: 400, message: "Account already connected"})
  }
 
  try{
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
console.log("connecting account!!")
const {  email, businessType, businessName,  firstName, lastName, city, line1, postalCode, state, dobDay, dobMonth, dobYear, phone, ssnLast4, statementDescriptor } = req.body;
const account = await stripe.accounts.create({
type: 'custom',
country: 'US',
email: email,
type: 'custom',
business_type: businessType,
   
capabilities: {
  card_payments: {
    requested: true,
  },
  transfers: {
    requested: true,
  },
},
business_profile: {
  name: businessName,
  mcc:  5817,       //"5734", // Demo MCC
  url: "https://accessible.stripe.com" // Demo URL
},
individual: {
  address: {
    city:   city,   //"Miami",
    line1:  line1,         // "address_full_match",
    postal_code:  postalCode ,         //"33101",
    state:  state      //"Florida"
  },
  dob: {
    day: dobDay,  //01
    month: dobMonth, //01
    year:  dobYear   //1902
  },
  email: email,
  first_name: firstName,
  last_name: lastName,
  phone:   phone,     //"+1 (754) 971-9348",
  ssn_last_4: ssnLast4
},
settings: {
  payments: {
    statement_descriptor: statementDescriptor  // Demo statement descriptor
  }
},
tos_acceptance: {
  date: Math.floor(Date.now() / 1000), // Current timestamp
  ip: "127.0.0.1" // Demo IP address
}


})
// console.log(account)
console.log(account.id)
try{
  console.log("accoundt Id: ",account.id)
  console.log("userId: ",userId)
  const stripeAccount = new Stripe({
      userId: userId,
      stripeAccountId: account.id, // Use account.id instead of connectAccount.id
  });

  
    // Save the document to the database
    const savedStripeAccount = await stripeAccount.save();
    console.log(savedStripeAccount)
    return res.status(200).send({status: 200, message: "Account connected successfully"})
}catch(e){
  console.log("Exception: ",e)
  const deleted = await stripe.accounts.del(account.id);
  console.log(deleted);

  return res.status(500).send({status: 500, message: "Error connecting account"})
  
}





  }catch(e){
    console.log("Exception: ",e)
      return res.status(500).send({status: 500,message: e.message})
  }
  


}

//get account
const getAccountInfo = async(req,res)=>{
    const userId = req.decoded.id;
    const stripeDetails = await Stripe.findOne({userId: userId})
    console.log(stripeDetails)

    if (!stripeDetails) {
      return res.status(403).json({ message: "User not found" });
    }
    
    try{
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        console.log("stripe account Id: ",stripeDetails.stripeAccountId)
        const account = await stripe.accounts.retrieve(stripeDetails.stripeAccountId);  //Chai Grill 
          console.log(account)
          res.send({accountInfo: account})

    }catch(err){
        console.log(err)
        res.send({error: err})
    }
}

const addExternalAccount =  async (req, res) => {
    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const userId = req.decoded.id;
       // Extract bank account details from request body
    const { bankName,bankAccountNumber, routingNumber } = req.body;
    console.log(bankName,bankAccountNumber.length, routingNumber.length)
    const stripeDetails = await Stripe.findOne({userId: userId})


    // Create external account object to add to Stripe account
    const externalAccount = await stripe.accounts.createExternalAccount(
      stripeDetails.stripeAccountId, // Assuming you have stored the connected Stripe account ID in the user object
      {
        external_account: {
          object: "bank_account",
          account_number: bankAccountNumber,
          routing_number: routingNumber,
          currency: "usd", // Change currency as needed
          account_holder_name: bankName,
          account_holder_type: "individual",
          country: "US", // Change country as needed
          default_for_currency: true,
        

        },
      }
    );

    console.log(externalAccount)
    // Save the document to the database
    const updatedStripeAccount = await Stripe.findOneAndUpdate(
      { userId: userId },
      { $set: { connectedBankAccountId: externalAccount.id } },
      { new: true }
    );

    console.log(updatedStripeAccount);
    // Return success response
    res.status(200).json({ success: true, externalAccount });
    } catch (error) {
      console.error('Error adding external account:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }


//verify account
const verifyAccount = async(req,res)=>{
  const userId = req.decoded.id;
  const stripeDetails = await Stripe.findOne({userId: userId})
  console.log(stripeDetails)

  if (!stripeDetails) {
    return res.status(403).json({ message: "User not found" });
  }
  try{
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log("Stripe account: ",stripeDetails.stripeAccountId)
const accountLink = await stripe.accountLinks.create({
  account: stripeDetails.stripeAccountId,
  refresh_url: 'https://example.com/reauth',
  return_url: 'https://example.com/return',
  type: 'account_onboarding',
});
console.log(accountLink)

return res.status(200).send({accountLink: accountLink.url})
  }catch(e){
    console.log(e)
    return res.status(500).send({message: "Error updating account"})
  }
}




  //View Balance
  const ViewBalance = async(req,res)=>{
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const userId = req.decoded.id;
    console.log("userId: ",userId)
      const stripeDetails = await Stripe.findOne({ userId: userId})

    try{
        const balance = await stripe.balance.retrieve(
            {
              expand: ['instant_available.net_available'],
            },
            {
              stripeAccount: stripeDetails.stripeAccountId,   //Chai Grill
            }
          );
        res.send({balance: balance})
  }catch(e){
    console.log(e)
    res.send({error: e})
  }

}
const ConectectedAccountExists = async (req, res) => {
  const userId = req.decoded.id;
console.log("userId: ",userId)
  const stripeDetails = await Stripe.findOne({ userId: userId})
  console.log(stripeDetails)
  if (!stripeDetails) {
    return res.status(403).json({connected: false});
  }
  res.send({connected: true})
}
module.exports = {
    connectAccount,
    getAccountInfo,
    addExternalAccount,
    ViewBalance,
    verifyAccount,
    createSession,
    ConectectedAccountExists,
    checkout
  };
  