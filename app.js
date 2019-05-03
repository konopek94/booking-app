const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const app = express()

const Event = require('./models/event')

app.use(bodyParser.json())

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
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
                        return { ...event._doc, _id: event.id }
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
                date: new Date(args.eventInput.date)
            })
            return event
                .save()
                .then((result) => {
                    console.log(result)
                    return { ...result._doc, _id: result._doc._id }
                }).catch(err => {
                    console.log(err)
                    throw err
                })
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