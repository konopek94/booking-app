const bcrypt = require('bcryptjs')

const Event = require('../../models/event')
const User = require('../../models/user')

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(event => {
            return {
                ...event._doc, _id: event.id,
                date: new Date(args.eventInput.date).toISOString(),
                creator: user.bind(this, event.creator)
            };
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

module.exports = {
    events: async args => {
        try {
            const events = await Event.find()
            console.log('args', args)
            console.log('events', events)
            return events.map(event => {
                return {
                    ...event._doc,
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                }
            })
        }
        catch (err) {
            throw err
        }
    },
    bookings: async () => {
        try {
            const bookings = await bookings.find()
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    _id: booking.id,
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString(),
                }
            })
        }
        catch(err) {
            throw err
        }
    },
    createEvent: async args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +(args.eventInput.price),
            date: new Date(args.eventInput.date),
            creator: '5ccdebb2eadda23648c8b7d7'
        })
        let createdEvent
        try {
            const result = await event.save()
            createdEvent = {
                ...result._doc, _id: result._doc._id.toString(),
                date: new Date(args.eventInput.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            }
            const creator = await User.findById('5ccdebb2eadda23648c8b7d7')
            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createdEvents.push(event)
            await creator.save()
            return createdEvent
        }
        catch (err) {
            throw err
        }
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
}