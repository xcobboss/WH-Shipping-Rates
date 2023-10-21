function calculateRates() {
    // Send a POST request to the proxy server
    const apiKey = 'uUzZmizI1M2oCpHoj1mlAEWpPE2NMOqe/0MT0U73zyw'; // Replace with your ShipEngine API key
    const shipengineUrl = 'https://ccfk2jgnxc.execute-api.us-east-2.amazonaws.com/Prod/proxy'; // Replace with your AWS Lambda API endpoint
    const bottleCount = parseInt(document.getElementById('bottleCount').value);

    // Calculate package weight based on the number of bottles (assuming each bottle weighs 16 ounces)
    const packageWeight = bottleCount * 64; // 16 ounces per pound 4*16=64

    // Determine the package code based on the number of bottles
    let packageCode = '';
    if (bottleCount === 1) {
        packageCode = 'custom_1_bottle';
    } else if (bottleCount === 2) {
        packageCode = 'custom_2_bottle';
    } else if (bottleCount === 3) {
        packageCode = 'custom_3_bottle';
    } else if (bottleCount >= 4 && bottleCount <= 6) {
        packageCode = 'custom_6_bottle';
    } else if (bottleCount >= 7 && bottleCount <= 12) {
        packageCode = 'custom_12_bottle';
    }

    // Update the package information
    const packageCodeElement = document.getElementById('packageCode');
    const packageWeightElement = document.getElementById('packageWeight');
    const confirmationElement = document.getElementById('confirmation'); // Added
    const containsAlcoholElement = document.getElementById('containsAlcohol'); // Added

    packageCodeElement.textContent = packageCode;
    packageWeightElement.textContent = packageWeight;

    // Get ship-to address input values
    const shipToName = document.getElementById('shipToName').value;
    const shipToPhone = document.getElementById('shipToPhone').value;
    const shipToAddress = document.getElementById('shipToAddress').value;
    const shipToCity = document.getElementById('shipToCity').value;
    const shipToState = document.getElementById('shipToState').value;
    const shipToPostalCode = document.getElementById('shipToPostalCode').value;
    const shipToCountryCode = document.getElementById('shipToCountryCode').value;

    const requestData = {
        rate_options: {
            carrier_ids: ['se-5327084'],
        },
        shipment: {
            validate_address: 'no_validation',
            ship_to: {
                name: shipToName,
                phone: shipToPhone,
                company_name: '',
                address_line1: shipToAddress,
                city_locality: shipToCity,
                state_province: shipToState,
                postal_code: shipToPostalCode,
                country_code: shipToCountryCode,
                address_residential_indicator: 'no',
            },
            ship_from: {
                name: 'Shipping',
                phone: '818-605-3245',
                company_name: 'The Wine House',
                address_line1: '2311 Cotner Ave',
                city_locality: 'Los Angeles',
                state_province: 'CA',
                postal_code: '90064',
                country_code: 'US',
                address_residential_indicator: 'no',
            },
            confirmation: 'adult_signature', // Corrected field name
            advanced_options: { // Corrected field name and removed extra quotation marks
                contains_alcohol: true, // Set to true for contains_alcohol
            },
            packages: [
                {
                    package_code: packageCode,
                    weight: {
                        value: packageWeight,
                        unit: 'ounce',
                    },
                },
            ],
        },
    };
    // Send a POST request directly to the ShipEngine API
    fetch(shipengineUrl, {
        method: 'POST',
        headers: {
            'API-Key': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    })
    .then(response => response.json())
    .then(data => {
        // Display the response in a table format
        console.log('Response Data:', data);
        const resultTable = document.getElementById('resultTable').getElementsByTagName('tbody')[0];
        resultTable.innerHTML = '';

        data.rate_response.rates.forEach(rate => {
            const row = resultTable.insertRow();
            const rateIdCell = row.insertCell(0);
            const serviceTypeCell = row.insertCell(1);
            const shippingAmountCell = row.insertCell(2);
            const estimatedDeliveryDateCell = row.insertCell(3);

            rateIdCell.textContent = rate.rate_id;
            serviceTypeCell.textContent = rate.service_type;
            // Display the shipping amount properly
            shippingAmountCell.textContent = `${rate.shipping_amount.amount} ${rate.shipping_amount.currency}`;
            estimatedDeliveryDateCell.textContent = rate.estimated_delivery_date;
        });

        // Display Confirmation and Contains Alcohol options
        confirmationElement.textContent = requestData.shipment.confirmation; // Use requestData to access confirmation
        containsAlcoholElement.textContent = requestData.shipment.advanced_options.contains_alcohol ? 'Yes' : 'No'; // Use requestData to access contains_alcohol
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Attach the calculateRates function to the button click event
document.getElementById('calculateRateButton').addEventListener('click', calculateRates);
