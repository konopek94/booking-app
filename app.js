const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const app = express()

const Event = require('./models/event')
const User = require('./models/user')

app.use(bodyParser.json())

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return { ...event._doc, _id: event.id, creator: user.bind(this, event.creator) };
        });
    }
    catch (err) {
        throw err;
    }
}

const user = async userId => {
    try {
        const user = await User.findById(userId);
        return { ...user._doc, _id: user.id, createdEvents: events.bind(this, user._doc.createdEvents) };
    }
    catch (err) {
        throw err;
    }
}

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: User!
        }

        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
        }

        input UserInput {
            email: String!
            password: String
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find()
                .then(events => {
                    return events.map(event => {
                        return {
                            ...event._doc,
                            _id: event.id,
                            creator: user.bind(this, event._doc.creator)
                        }
                    })
                }).catch(err => {
                    throw err
                })
        },
        createEvent: args => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +(args.eventInput.price),
                date: new Date(args.eventInput.date),
                creator: '5ccdebb2eadda23648c8b7d7'
            })
            let createdEvent
            return event
                .save()
                .then((result) => {
                    createdEvent = { ...result._doc, _id: result._doc._id.toString(), creator: user.bind(this, result._doc.creator) }
                    return User.findById('5ccdebb2eadda23648c8b7d7')
                })
                .then(user => {
                    if (!user) {
                        throw new Error('User not found.');
                    }
                    user.createdEvents.push(event)
                    return user.save()
                })
                .then(() => {
                    return createdEvent
                })
                .catch(err => {
                    console.log(err)
                    throw err
                })
        },
        createUser: async args => {
            try {
                const user = await User.findOne({ email: args.userInput.email });
                if (user) {
                    throw new Error('User exists already.');
                }
                const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
                const newUser = new User({
                    email: args.userInput.email,
                    password: hashedPassword,
                });
                const result = newUser.save();
                return { ...result._doc, password: null, _id: result.id };
            }
            catch (err) {
                throw err;
            }
        }
    },
    graphiql: true,
}))

mongoose.connect(`mongodb://localhost:27017/${process.env.MONGO_DB}`, { useNewUrlParser: true }).then(() => {
    console.log('connected to mongo db')
    app.listen(3000)
}).catch(err => {
    console.log(err)
})