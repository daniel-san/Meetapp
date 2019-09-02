import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async index(req, res, next) {}

  async store(req, res, next) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [User],
    });

    /**
     * Checking if the user created the meetup
     */
    if (req.userId === meetup.user_id) {
      return res
        .status(400)
        .json({ error: "You can't subscribe to your own meetups" });
    }

    /**
     * Checking if the meetup is in the past
     */
    if (meetup.past) {
      return res
        .status(400)
        .json({ error: "You can't subscribe to past meeupts" });
    }

    /**
     * Checking if the user is trying to subscribe to an already subscribed meetup
     */
    const checkDuplicate = await Subscription.findOne({
      where: {
        user_id: user.id,
        meetup_id: req.params.meetupId,
      },
    });

    if (checkDuplicate) {
      return res
        .status(400)
        .json({ error: "You can't subscribe to a meetup twice" });
    }

    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res.status(400).json({
        error:
          "You can't subscribe to two meetups that happen at the same time",
      });
    }

    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    return res.json(subscription);
  }

  async update(req, res, next) {}

  async delete(req, res, next) {}
}

export default new SubscriptionController();
