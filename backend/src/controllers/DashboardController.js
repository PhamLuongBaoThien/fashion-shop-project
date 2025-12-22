const DashboardService = require('../services/DashboardService');

const getAllStats = async (req, res) => {
    try {
        const { year, month } = req.query;

        const response = await DashboardService.getAllStats(year,month);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

module.exports = { getAllStats };