function updateFields() {
    let category = document.getElementById("category").value;
    const inputFields = document.getElementById("inputFields");
    inputFields.innerHTML = ""; 

    const commonFields = `
        <div class="input-container">
            <label for="first_name">First Name*</label>
            <input type="text" id="first_name" required placeholder="Enter Your First Name">
        </div>

        <div class="input-container">
            <label for="last_name">Last Name</label>
            <input type="text" id="last_name" placeholder="Enter Your Last Name">
        </div>

        <div class="input-container">
            <label for="email">Email Address*</label>
            <input type="email" id="email" required placeholder="Enter Your Email Address">
        </div>

        <div class="input-container">
            <label for="phone">Phone Number*</label>
            <div class="phone-input-container">
                <select id="country_code" required onchange="updateMobileNo()">
                    <option value="+91">India (+91)</option>
                    <option value="+1">USA (+1)</option>
                    <option value="+44">UK (+44)</option>
                    <option value="+61">Australia (+61)</option>
                    <option value="+81">Japan (+81)</option>
                    <option value="+49">Germany (+49)</option>
                    <option value="+33">France (+33)</option>
                    <option value="+55">Brazil (+55)</option>
                    <option value="+7">Russia (+7)</option>
                    <option value="+27">South Africa (+27)</option>
                </select>
                <input type="tel" id="phone" required placeholder="Enter Your Phone Number" oninput="updateMobileNo()">
            </div>
        </div>

        <input type="hidden" id="mobile_no" name="mobile_no">

        <div class="input-container">
            <label for="address">Address*</label>
            <input id="address" required placeholder="Enter Your Address"></input>
        </div>

        <div class="input-container">
            <label for="state">State</label>
            <input type="text" id="state" placeholder="Enter Your State">
        </div>

        <div class="input-container">
            <label for="country">Country</label>
            <input type="text" id="country">
        </div>
    `;

    const fields = {
        "IAOI MEMBERS": `
            <div class="input-container">
                <label for="member_id">Member ID*</label>
                <input type="text" id="member_id" required placeholder="Enter Member ID" onblur="fetchMemberDetails()">
            </div>
        `,

        "AFFLIATE MEMBERS": `
            <div class="input-container">
                <label for="association_id">Association ID</label>
                <input type="text" id="association_id" placeholder="Enter Association ID">
            </div>
            <div class="input-container">
                <label for="association_name">Association Name</label>
                <input type="text" id="association_name" required placeholder="Enter Your Association Name">
            </div>
        `,

        "COMBO - NEW MEMBER + CONFERENCE": `
            <div class="input-container">
                <label for="dci-reg-no">DCI Reg No</label>
                <input type="text" id="dci-reg-no" required placeholder="Enter DCI Reg No">
            </div>
        `,

        "GROUP REGISTRATIONS": `
            <div class="input-container">
                <label for="member_ids">Member IDs (click "+" to add)</label>
                <input type="text" id="member_ids" required  placeholder="Enter Member ID">
                <button id="add_id_button" class="submit-button">+</button>
            </div>
            <div id="verification_results"></div>
        `,

        "INTERNATIONAL DELEGATES": ""
    };
    if (category && fields[category] !== undefined) {
        inputFields.innerHTML = fields[category] + commonFields;
    } else {
        inputFields.innerHTML = commonFields;
    }
}
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        const memberIdInput = document.getElementById("member_ids");
        const memberId = memberIdInput.value.trim();
        if (memberId) {
            verifyMemberId(memberId);
            memberIdInput.value = "";
        }
    }
}
function updateMobileNo() {
    const countryCode = document.getElementById('country_code').value;
    const phoneNumber = document.getElementById('phone').value;
    const mobileNo = countryCode + phoneNumber;
    document.getElementById('mobile_no').value = mobileNo;
}
function verifyMemberId(memberId) {
    const resultsContainer = document.getElementById("verification_results");
    fetch(`https://dev.iaoi.in/api/v1/member/findMember/${memberId}`)
        .then(response => response.json())
        .then(data => {
            const tag = document.createElement("div");
            tag.className = "tag";
            if (data.statusCode === 200 && data.result.length > 0) {
                const member = data.result[0];
                tag.classList.add("verified");
                tag.innerHTML = `<strong>${memberId}</strong>: Verified - ${member.fullName} <span class="delete" onclick="removeTag(this)">X</span>`;
            } else {
                tag.classList.add("not-found");
                tag.innerHTML = `<strong>${memberId}</strong>: Not a Member <span class="delete" onclick="removeTag(this)">X</span>`;
            }
            resultsContainer.appendChild(tag);
        })
        .catch(() => {
            const memberIdInput = document.getElementById("member_ids");
            memberIdInput.value = "";
            memberIdInput.placeholder = "Error fetching details";
            memberIdInput.classList.add("error");
        });
}

function removeTag(tagElement) {
    const tag = tagElement.parentElement;
    tag.remove();
}
function fetchMemberDetails() {
    const memberId = document.getElementById("member_id").value.trim();
    const errorMessage = document.getElementById("error-message");

    if (!memberId) return;

    fetch(`https://dev.iaoi.in/api/v1/member/findMember/${memberId}`)
        .then(response => response.json())
        .then(data => {
            if (data.statusCode === 200 && data.result.length > 0) {
                const member = data.result[0];
                document.getElementById("first_name").value = member.first_name || "";
                document.getElementById("last_name").value = member.last_name || "";
                document.getElementById("email").value = member.email_id || "";
                document.getElementById("country").value = member.country || "";
                document.getElementById("phone").value = (member.mobile_no || "").replace(/^\+91-/, "");
                document.getElementById("address").value = member.address || "";
                document.getElementById("state").value = member.state || "";
                errorMessage.style.display = "none";
            } else {
                errorMessage.style.display = "block";
            }
        })
        .catch(() => errorMessage.style.display = "block");
}
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("step0").style.display = "block";
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "none";
});
function handleMembershipChoice(choice) {
    document.getElementById("step0").style.display = "none";
    document.getElementById("step1").style.display = "block";
    let categorySelect = document.getElementById("category");
    categorySelect.innerHTML = "";

    if (choice === "yes") {
        let iaoiOption = new Option("IAOI Members", "IAOI MEMBERS");
        let groupOption = new Option("Group Registration (Min 10 Members)", "GROUP REGISTRATIONS");
        categorySelect.appendChild(iaoiOption);
        categorySelect.appendChild(groupOption);
        categorySelect.value = "IAOI MEMBERS";
    } else {
        categorySelect.innerHTML = `
        <option value="COMBO - NEW MEMBER + CONFERENCE" selected>Combo - New Member + Conference</option>
        <option value="AFFLIATE MEMBERS">Affiliate Association Members</option>
            <option value="INTERNATIONAL DELEGATES">International Delegates</option>
        `;
    }
    updateFields();
}
async function nextStep() {
    const phone = document.getElementById("phone").value.trim();
    const first_name = document.getElementById("first_name").value.trim();
    const last_name = document.getElementById("last_name").value.trim();
    console.log(phone,first_name,last_name);
    const category = document.getElementById("category").value;
    if (!category) {
        alert("Please select a plan first!");
        return;
    }

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
    document.getElementById("selected_plan").innerText = category;

    const today = new Date();
    const todayTimestamp = today.getTime();
    let planAmount = 0;

    const cutoffDates = {
        "IAOI MEMBERS": [new Date("2025-03-31"), new Date("2025-05-30"), new Date("2025-07-31")],
        "AFFLIATE MEMBERS": [new Date("2025-03-31"), new Date("2025-05-30"), new Date("2025-07-31")],
        "COMBO - NEW MEMBER + CONFERENCE": [new Date("2025-05-30")],
        "GROUP REGISTRATIONS": [new Date("2025-05-30")],
        "INTERNATIONAL DELEGATES": [new Date("2025-03-31"), new Date("2025-05-30"), new Date("2025-07-31")]
    };

    async function getExchangeRate() {
        try {
            const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
            const data = await response.json();
            return data.rates.INR;
        } catch (error) {
            console.error("Error fetching exchange rate:", error);
            return 83;
        }
    }

    let usdToInr = await getExchangeRate();

    if (category === "IAOI MEMBERS") {
        planAmount = todayTimestamp <= cutoffDates[category][0].getTime() ? 6500 :
            todayTimestamp <= cutoffDates[category][1].getTime() ? 7500 : 10000;
    } else if (category === "AFFLIATE MEMBERS") {
        planAmount = todayTimestamp <= cutoffDates[category][0].getTime() ? 8500 :
            todayTimestamp <= cutoffDates[category][1].getTime() ? 9000 : 9900;
    } else if (category === "COMBO - NEW MEMBER + CONFERENCE") {
        planAmount = todayTimestamp <= cutoffDates[category][0].getTime() ? 11000 : 0;
    }
    else if (category === "GROUP REGISTRATIONS") {
        amount = todayTimestamp <= cutoffDates[category][0].getTime() ? 6000 : 0;
        planAmount = amount * 10;
    }
    else if (category === "INTERNATIONAL DELEGATES") {
        let usdAmount = todayTimestamp <= cutoffDates[category][1].getTime() ? 175 : 200;
        planAmount = usdAmount * usdToInr;
    }
    const gstAmount = planAmount * 0.18;
    const totalAmount = planAmount + gstAmount;

    document.getElementById("plan_amount").innerText = `₹ ${planAmount.toFixed(2)}`;
    document.getElementById("gst_amount").innerText = `₹ ${gstAmount.toFixed(2)}`;
    document.getElementById("total_amount").innerText = `₹ ${totalAmount.toFixed(2)}`;
}


function prevStep() {
    if (document.getElementById("step1").style.display === "block") {
        document.getElementById("step1").style.display = "none";
        document.getElementById("step0").style.display = "block";
    } else if (document.getElementById("step2").style.display === "block") {
        document.getElementById("step2").style.display = "none";
        document.getElementById("step1").style.display = "block";
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    const countryInput = document.getElementById("country");
    const suggestionsBox = document.getElementById("suggestions");

    let countries = [];

    // Fetch country list from API
    async function fetchCountries() {
        try {
            const response = await fetch("https://restcountries.com/v3.1/all");
            const data = await response.json();
            countries = data.map(country => country.name.common).sort();
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    }

    await fetchCountries();

    // Filter and show suggestions
    countryInput.addEventListener("input", () => {
        const query = countryInput.value.toLowerCase();
        suggestionsBox.innerHTML = "";
        if (!query) return;

        const filteredCountries = countries.filter(country =>
            country.toLowerCase().startsWith(query)
        ).slice(0, 10); // Limit to 10 suggestions

        filteredCountries.forEach(country => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = country;
            div.addEventListener("click", () => {
                countryInput.value = country;
                suggestionsBox.innerHTML = "";
            });
            suggestionsBox.appendChild(div);
        });
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (event) => {
        if (!event.target.closest(".input-container")) {
            suggestionsBox.innerHTML = "";
        }
    });
});


