import * as Yup from 'yup';
import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import File from '../models/File';
import User from '../models/User';

class MeetupController {
  async index(req, res, next) {
    const { date } = req.query;
    const where = {};
    const page = req.query.page || 1;

    if (date) {
      const searchDate = parseISO(date);
      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      include: [User],
      limit: 10,
      offset: 10 * page - 10,
    });

    return res.json(meetups);
  }

  async store(req, res, next) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    /**
     * Yup validation
     */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    /**
     * Verifying if user is trying to create a meetup in the past
     */
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot create a meetup in the past' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);
  }

  async update(req, res, next) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      file_id: Yup.number().required(),
    });

    /**
     * Yup validation
     */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const meetup_id = req.params.id;

    const meetup = await Meetup.findByPk(meetup_id, {
      include: [
        {
          model: File,
          attributes: ['name', 'path'],
        },
      ],
    });

    /**
     * If the meetup doesn't exist
     */
    if (!meetup) {
      return res.status(500).json({ error: 'That meetup does not exist' });
    }

    /**
     * If the meetup already happened
     */
    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot modify a meetup that already happened' });
    }

    /**
     * If the user is trying to update a meetup to happen in the past
     */
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot update a meetup to happen in the past' });
    }

    /**
     * Verifying if the user owns the passed meetup
     */
    if (meetup.user_id !== req.userId) {
      return res
        .status(400)
        .json({ error: "You don't have permission to update this meetup" });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res, next) {
    const meetup_id = req.params.id;

    const meetup = await Meetup.findByPk(meetup_id);

    if (!meetup) {
      return res.status(500).json({ error: 'That meetup does not exist' });
    }

    /**
     * Verifying if the meetup already happened
     */
    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot delete a meetup that already happened' });
    }

    /**
     * Verifying if the user owns the passed meetup
     */
    if (meetup.user_id !== req.userId) {
      return res
        .status(400)
        .json({ error: "You don't have permission to delete this meetup" });
    }

    await meetup.destroy();

    return res.json({ message: 'Meetup succesfully deleted' });
  }
}

export default new MeetupController();
