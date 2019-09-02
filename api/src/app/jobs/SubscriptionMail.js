import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;
    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: `${meetup.title} - You have a new subscription`,
      template: 'subscription',
      context: {
        meetup: meetup.title,
        organizer: meetup.User.name,
        user: user.name,
        email: user.email,
      },
    });
  }
}

export default new SubscriptionMail();
