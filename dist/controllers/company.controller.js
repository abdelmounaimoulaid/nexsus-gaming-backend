"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyController = void 0;
const company_service_1 = require("../services/company.service");
const companyService = new company_service_1.CompanyService();
class CompanyController {
    async getAllCompanies(req, res) {
        try {
            const companies = await companyService.getAllCompanies();
            res.json(companies);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async createCompany(req, res) {
        try {
            const company = await companyService.createCompany({
                ...req.body,
                createdById: req.user?.id
            });
            res.status(201).json(company);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.CompanyController = CompanyController;
