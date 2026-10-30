// Official Store Bank & Raast Transfer Information for Hamza Phone Store

export interface BankAccountInfo {
  bankName: string;
  branch: string;
  accountTitle: string;
  accountNumber: string;
  cleanAccountNumber: string;
  iban: string;
}

export const STORE_BANK_DETAILS = {
  accountTitle: 'Hamza Phone Store',
  raastId: '03135221200',
  raastTitle: 'Hamza Phone Store',
  primaryBank: {
    bankName: 'Meezan Bank Ltd',
    branch: 'Abbottabad / Main Branch',
    accountTitle: 'Hamza Phone Store',
    accountNumber: '0201-0108920192',
    cleanAccountNumber: '02010108920192',
    iban: 'PK42MEZN0002010108920192',
  },
  secondaryBank: {
    bankName: 'Bank Alfalah',
    branch: 'Islamic Banking Branch',
    accountTitle: 'Hamza Phone Store',
    accountNumber: '5501-5001239871',
    cleanAccountNumber: '55015001239871',
    iban: 'PK12ALFH55015001239871',
  },
  whatsappHelpline: '+92 313 5221200',
  whatsappRaw: '923135221200',
};
