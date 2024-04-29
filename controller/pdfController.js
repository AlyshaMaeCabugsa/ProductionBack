const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const Establishment = require('../models/Establishment');

const fieldMaps = {
  'FSED-32F': {
    fscibseNoR: 'Text-PxappP_rse',
    date: 'Date-JSLSRyiugD',
    tradeName: 'Text-Ermz-pYGq4',
    address: 'Text-yX9n2oWXq6',
    ownerRepresentative: 'Text-3Y0RtcPZE9',
    installerCompany: 'Text-MouWqpgIgO',
    amountPaid: 'Text-vpCb0rgXpS',
    orNumber: 'Text-19xxa2mhVZ',
    paymentDate: 'Date-0SonBqY91h',
    chiefFses: 'Text-q2qyXAEOlt',
    fireMarshal: 'Text-waPeUkp5XP'
  },
  'FSED-35F': {
    fscibseNoR: 'fscdpm',
    date: 'Date-0N6SUwBAhg',
    tradeName: 'building',
    address: 'address',
    ownerRepresentative: 'owner',
    installerCompany: 'installer',
    validUntil: 'DATE',
    month: 'Month',
    year: 'YEAR',
    amountPaid: 'amountpaid',
    orNumber: 'OR',
    paymentDate: 'Date-vb4bkBkY5-',
    recommendApproval: 'Text-8o3rsYWJGz',
    approvedBy: 'Text-kxJY211ZDt'
  },
  'FSED-47F': {
    fscibseNoR: 'Text-VwEmShWC1m',
    date: 'Date-CMjWTTknFs',
    tradeName: 'Text-tEhrdV8yeT',
    address: 'Text-B4CuG6Uh5P',
    ownerRepresentative: 'Text-jqJPYyVMyQ',
    dayStart: 'Date-2xpBl7m50Y',
    dayEnd: 'Date-JFkmDMvxyO',
    amountPaid: 'Text-3sFLa0tKJm',
    orNumber: 'Text-bNFfx59Ion',
    paymentDate: 'Text-Vx5_rq3EXW',
    recommendApproval: 'Text-Vc67LDe8Ik',
    approvedBy: 'Text-_BT7UAKeK7',
  },
  'FSED-36F': {
    fscibseNoR: 'Text6',
    date: 'DATE',
    tradeName: 'building',
    address: 'located at',
    ownerRepresentative: 'owned by',
    companyInstaller: 'and to be installed by',
    appliancesInstalled: 'Appliances Installed',
    dateInstalled: 'Date Installed',
    mechanicanicalEngineer: 'Professional Mechanical Engineer',
    PRCIDNo: 'PRC ID NO',
    AmountPaid: 'Amount Paid',
    orNumber: 'OR Number',
    paymentDate: 'Date',
    ChiefFSES: 'CHIEF FSES',
    CityMunicipalFireMarshal: 'CITYMUNICIPAL FIRE MARSHAL',
  },
  'FSED-038F': {
    fscibseNoR: 'FSCCHMCCV NO R',
    date: 'Date5_af_date',
    tradeName: 'Chemicals in Cargo Vehicles to',
    address: 'located at',
    TypeofVehicle: 'Type of Vehicle',
    PlateNumber: 'Plate Number',
    MotorNumber: 'Motor Number',
    ChassisNumber: 'Chassis Number',
    NameOfDriver: 'Name of Driver',
    LicenseNumber: 'License Number',
    TrailerNumber: 'If with trailer Trailer Number',
    Capacity: 'Capacity LitersKilograms',
    ValidUntil: 'This clearance is valid until',
    AmountPaid: 'Amount Paid',
    orNumber: 'OR Number',
    paymentDate: 'Date',
    ChiefFSES: 'CHIEF FSES',
    CityMunicipalFireMarshal: 'CITYMUNICIPAL FIRE MARSHAL',
  },
  'FSED-39F': {
    fscibseNoR: 'Text2',
    date: 'Date3_af_date',
    tradeName: 'Name of Building Structure Facility',
    ownerRepresentative: 'Name of Owner',
    address: 'Location',
    Voltage: 'Voltage',
    NoOfPhase: 'No of Phase',
    TotalConnectedLoad: 'Total Connected Load',
    MainCircuitBreaker: 'Main Circuit Breaker',
    InstalledBy: 'Installed By',
    PRCLicenseNumber: 'PRC License Number',
    ValidUntil: 'Valid Until',
    AmountPaid: 'Amount Paid',
    ORNumber: 'OR Number',
    paymentDate: 'Date',
    ChiefFSES: 'CHIEF FSES',
    CityMunicipalFireMarshal: 'CITYMUNICIPAL FIRE MARSHAL',
  },
  'FSED-40F': {
    fscibseNoR: 'FSCFWE NO R',
    date: 'DATE',
    ContructorName: 'issued to',
    address: 'located at',
    NameOfOwner: 'owned by',
    DateConducted: 'Conducted',
    DurationOfExhibition: 'duration',
    SupervisedBy: 'by',
    ValidUntil: 'This clearance is valid until',
    AmountPaid: 'Amount Paid',
    orNumber: 'OR Number',
    paymentDate: 'Date',
    ChiefFSES: 'CHIEF FSES',
    CityMunicipalFireMarshal: 'CITYMUNICIPAL FIRE MARSHAL',
  },
  'FSED-42F': {
    fscibseNoR: 'Text1',
    date: 'DATE',
    tradeName: 'Name of Building FacilityStructure',
    address: 'Address',
    ownerRepresentative: 'Name of Owner',
    BusinessOperationAs: 'for its business operation as',
    InstalledBy: 'Name of InstallerCompany',
    AmountPaid: 'Amount Paid',
    orNumber: 'OR Number',
    paymentDate: 'Date',
    ChiefFSES: 'CHIEF FSES',
    CityMunicipalFireMarshal: 'CITYMUNICIPAL FIRE MARSHAL',
  }
};

exports.fillPDFByTemplateName = async (req, res) => {
    const templateName = req.params.template; // 'FSED-32F', 'FSED-35F', 'FSED-47F', etc.
    const tradeName = req.body.tradeName; // The trade name used to fetch the establishment data
  
    try {
      // Fetch establishment data from the database
      const establishment = await Establishment.findOne({ tradeName: new RegExp(tradeName, 'i') });
      if (!establishment) {
        return res.status(404).send('Establishment not found');
      }
  
      // Load the PDF template
      const pdfPath = path.resolve(__dirname, `../pdf/${templateName}.pdf`);
      if (!fs.existsSync(pdfPath)) {
        return res.status(404).send('PDF template not found');
      }
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();
  
      // Get the field map for the current template
      const fieldMap = fieldMaps[templateName];
      if (!fieldMap) {
        return res.status(404).send('Field map for the template not found');
      }
  
      // Fill the form fields using both the body and the establishment data
      Object.entries(fieldMap).forEach(([key, formFieldName]) => {
        const field = form.getField(formFieldName);
        let value = req.body[key]; // First, take the value from the request body
  
        // If the field is meant to be auto-filled from the establishment data, replace the value
        if (!value && establishment[key]) {
          value = establishment[key];
        }
  
        // Apply the value to the PDF field
        if (field && value !== undefined) {
          field.setText(value.toString());
        }
      });
  
      // Serialize the PDFDocument to bytes
      const filledPdfBytes = await pdfDoc.save();
  
      // Send the filled PDF back as a response
      res.setHeader('Content-Disposition', `attachment; filename=filled-${templateName}.pdf`);
      res.setHeader('Content-Type', 'application/pdf');
      res.end(filledPdfBytes, 'binary');
    } catch (error) {
      console.error('Error when filling PDF:', error);
      res.status(500).send('Internal Server Error');
    }
  };