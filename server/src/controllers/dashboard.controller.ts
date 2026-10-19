import { Request, Response, NextFunction } from 'express';
import { Campaign } from '../models/campaign.model';
import { CollaborationRequest } from '../models/collaborationRequest.model';
import { Contract } from '../models/contract.model';
import { Task } from '../models/task.model';
import { Submission } from '../models/submission.model';
import { TalentLink } from '../models/talentLink.model';
import { User } from '../models/user.model';
import { AppError } from '../utils/AppError';

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const userId = req.user._id;
    const role = req.user.role;

    if (role === 'brand') {
      const [
        totalCampaigns,
        activeCampaigns,
        pendingRequests,
        activeContracts,
        allCampaigns,
        recentContracts,
      ] = await Promise.all([
        Campaign.countDocuments({ brand: userId }),
        Campaign.countDocuments({ brand: userId, status: { $in: ['open', 'inProgress'] } }),
        CollaborationRequest.countDocuments({ brand: userId, status: 'pending' }),
        Contract.countDocuments({ brand: userId, status: 'signed' }),
        Campaign.find({ brand: userId }).select('budget status').lean(),
        Contract.find({ brand: userId })
          .populate('creator', 'name avatarUrl')
          .populate('campaign', 'title budget')
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean(),
      ]);

      const totalBudgetAllocated = allCampaigns.reduce((acc, c) => acc + (c.budget || 0), 0);

      // Pending submissions to review for this brand
      const brandContracts = await Contract.find({ brand: userId }).select('_id');
      const contractIds = brandContracts.map((c) => c._id);
      const pendingSubmissionsCount = await Submission.countDocuments({
        contract: { $in: contractIds },
        status: 'pending_review',
      });

      res.status(200).json({
        success: true,
        data: {
          role,
          kpis: {
            totalCampaigns,
            activeCampaigns,
            pendingRequests,
            activeContracts,
            pendingSubmissionsCount,
            totalBudgetAllocated,
          },
          recentContracts,
        },
      });
      return;
    }

    if (role === 'creator') {
      const [
        acceptedCollabs,
        pendingRequests,
        activeContracts,
        signedContracts,
        activeTasks,
        pendingSubmissions,
        recentContracts,
        recentTasks,
      ] = await Promise.all([
        CollaborationRequest.countDocuments({ creator: userId, status: 'accepted' }),
        CollaborationRequest.countDocuments({ creator: userId, status: 'pending' }),
        Contract.countDocuments({ creator: userId, status: 'signed' }),
        Contract.find({ creator: userId, status: 'signed' }).select('budget').lean(),
        Task.countDocuments({ assignee: userId, status: { $ne: 'done' } }),
        Submission.countDocuments({ creator: userId, status: 'changes_requested' }),
        Contract.find({ creator: userId })
          .populate('brand', 'name orgName avatarUrl')
          .populate('campaign', 'title budget')
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean(),
        Task.find({ assignee: userId })
          .sort({ dueDate: 1, createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

      const totalEarningsTracked = signedContracts.reduce((acc, c) => acc + (c.budget || 0), 0);

      res.status(200).json({
        success: true,
        data: {
          role,
          kpis: {
            acceptedCollabs,
            pendingRequests,
            activeContracts,
            activeTasks,
            pendingSubmissions,
            totalEarningsTracked,
          },
          recentContracts,
          recentTasks,
        },
      });
      return;
    }

    if (role === 'freelancer') {
      const [
        activeTasks,
        completedTasks,
        activeContracts,
        recentTasks,
      ] = await Promise.all([
        Task.countDocuments({ assignee: userId, status: { $ne: 'done' } }),
        Task.countDocuments({ assignee: userId, status: 'done' }),
        Contract.countDocuments({ creator: userId, status: 'signed' }),
        Task.find({ assignee: userId })
          .sort({ dueDate: 1, createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          role,
          kpis: {
            activeTasks,
            completedTasks,
            activeContracts,
          },
          recentTasks,
        },
      });
      return;
    }

    if (role === 'talentManager') {
      const [
        rosterCount,
        pendingInvites,
        acceptedLinks,
      ] = await Promise.all([
        TalentLink.countDocuments({ talentManager: userId, status: 'accepted' }),
        TalentLink.countDocuments({ talentManager: userId, status: 'pending' }),
        TalentLink.find({ talentManager: userId, status: 'accepted' })
          .populate('creator', 'name email avatarUrl')
          .lean(),
      ]);

      const creatorIds = acceptedLinks.map((l: any) => l.creator?._id).filter(Boolean);
      const activeRosterContracts = await Contract.countDocuments({
        creator: { $in: creatorIds },
        status: 'signed',
      });

      res.status(200).json({
        success: true,
        data: {
          role,
          kpis: {
            rosterCount,
            pendingInvites,
            activeRosterContracts,
          },
          roster: acceptedLinks,
        },
      });
      return;
    }

    // Default / Admin fallback
    const [
      totalUsers,
      totalCampaigns,
      totalContracts,
      totalSubmissions,
    ] = await Promise.all([
      User.countDocuments({}),
      Campaign.countDocuments({}),
      Contract.countDocuments({}),
      Submission.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      data: {
        role,
        kpis: {
          totalUsers,
          totalCampaigns,
          totalContracts,
          totalSubmissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
