import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { Company, CompanyStatus, CompanyType } from '../types/app';

import { generateId } from './utils';

interface CompaniesState {
  companies: Company[];
  addCompany: (newCompany: Company) => Company;
  getCompanyById: (id: string) => Company | undefined;
  updateCompany: (companyId: string, updates: Partial<Company>) => void;
  deleteCompany: (companyId: string) => void;
  setCompanyStatus: (companyId: string, status: CompanyStatus) => void;
  getCompaniesByType: (type: CompanyType) => Company[];
}

export const useCompaniesStore = create<CompaniesState>()(
  devtools(
    immer((set, get) => ({
      companies: [],

      addCompany: newCompanyData => {
        const company: Company = {
          ...newCompanyData,
          id: newCompanyData.id ?? generateId(),
        };
        set(state => {
          state.companies.push(company);
        });
        return company;
      },

      getCompanyById: id => {
        return get().companies.find(c => c.id === id);
      },

      updateCompany: (companyId, updates) => {
        set(state => {
          const company = state.companies.find(c => c.id === companyId);
          if (company) {
            Object.assign(company, updates);
          }
        });
      },

      deleteCompany: companyId => {
        set(state => {
          state.companies = state.companies.filter(c => c.id !== companyId);
        });
      },

      setCompanyStatus: (companyId, status) => {
        set(state => {
          const company = state.companies.find(c => c.id === companyId);
          if (company) {
            company.status = status;
          }
        });
      },

      getCompaniesByType: type => {
        return get().companies.filter(c => c.companyType === type);
      },
    })),
    { name: 'CompaniesStore' }
  )
);
