import { Request, Response } from 'express';
import { CompanyService } from '../services/company.service';

const companyService = new CompanyService();

export class CompanyController {
    async getAllCompanies(req: Request, res: Response) {
        try {
            const companies = await companyService.getAllCompanies();
            res.json(companies);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async createCompany(req: Request, res: Response) {
        try {
            const company = await companyService.createCompany({
                ...req.body,
                createdById: (req as any).user?.id
            });
            res.status(201).json(company);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
