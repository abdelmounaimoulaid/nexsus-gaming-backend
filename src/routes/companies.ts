import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();
const companyController = new CompanyController();

router.get('/', requireAuth, companyController.getAllCompanies);
router.post('/', requireAuth, companyController.createCompany);

export default router;
