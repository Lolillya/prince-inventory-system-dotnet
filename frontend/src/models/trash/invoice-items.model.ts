/*}

[
    {
        "invoice_ID": 1,
        "invoice_Number": 1,
        "notes": "Sample Invoice Note",
        "total_Amount": 99999.00,
        "discount": 0.00,
        "status": "Sample Invoice Status",
        "term": 30,
        "createdAt": "2025-01-01T00:00:00",
        "customer": {
            "id": "4",
            "firstName": "Robert",
            "lastName": "Johnson",
            "companyName": "Johnson Elementary School",
            "email": "customer@example.com"
        },
        "clerk": {
            "id": "2",
            "firstName": "John",
            "lastName": "Doe",
            "email": "employee@prince.edu"
        },
        "lineItems": []
    }
]

*/

export type InvoiceItemsModel = {
  invoice_ID: number;
  invoice_Number: number;
  notes: string;
  total_Amount: number;
  status: string;
  term: number;
  createdAt: string;
  customer: InvoiceCustomer;
  clerk: InvoiceClerk;
};

type InvoiceCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
};

type InvoiceClerk = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};
