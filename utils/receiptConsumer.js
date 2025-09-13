import CommunicationLog from "../models/communicationLog.js";
import Campaign from "../models/campaign.js";  


const receiptQueue = [];

export function enqueueReceipt(receipt) {
  receiptQueue.push(receipt);
}

export function startReceiptConsumer() {
  setInterval(async () => {
    if (receiptQueue.length === 0) return;

    const batch = [...receiptQueue];
    receiptQueue.length = 0; 

    const bulkOps = batch.map(r => {
      const update = {
        status: r.status,
        delivered_at: r.delivered_at ? new Date(r.delivered_at) : new Date()
      };
      if (r.failure_reason) update.failure_reason = r.failure_reason;

      return {
        updateOne: {
          filter: { vendor_message_id: r.vendor_message_id },
          update: { $set: update }
        }
      };
    });

    try {
      await CommunicationLog.bulkWrite(bulkOps);
      const affectedCampaigns = [...new Set(batch.map(r => r.campaign_id))];

      for (let campaignId of affectedCampaigns) {
        const total = await CommunicationLog.countDocuments({ campaign_id: campaignId });
        const sentOrFailed = await CommunicationLog.countDocuments({
          campaign_id: campaignId,
          status: { $in: ["SENT", "FAILED"] }
        });

        if (total > 0 && sentOrFailed === total) {
          await Campaign.findByIdAndUpdate(campaignId, { status: "completed" });
        }
      }
    } catch (err) {
      console.error("Batch update error:", err.message);
    }
  }, 5000); 
}
