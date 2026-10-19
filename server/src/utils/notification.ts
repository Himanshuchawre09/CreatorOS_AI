import { Notification, NotificationType } from '../models/notification.model';
import { Types } from 'mongoose';

export const sendNotification = async (params: {
  recipient: Types.ObjectId | string;
  sender?: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}): Promise<void> => {
  try {
    await Notification.create({
      recipient: params.recipient,
      sender: params.sender,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      read: false,
    });
  } catch (err) {
    // Non-blocking notification error logging
    console.error('Failed to create notification:', err);
  }
};
