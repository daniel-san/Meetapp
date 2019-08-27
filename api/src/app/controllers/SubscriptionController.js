import User from '../models/User';
import Meetup from '../models/Meetup';

class SubscriptionController {
  async index(req, res, next) {}

  async create(req, res, next) {
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
      return res.status(400).json("You can't subscribe to past meeupts");
    }
  }

  async update(req, res, next) {}

  async delete(req, res, next) {}
}

export default new SubscriptionController();
