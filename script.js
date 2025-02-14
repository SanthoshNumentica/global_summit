function updateFields() {
    const category = document.getElementById("category").value;
    const inputFields = document.getElementById("inputFields");
    inputFields.innerHTML = "";

    // Common fields template
    const commonFields = `
<label for="name" class ="input-container">Full Name*</label>
<input type="text" id="name" required placeholder="Enter Your Full Name">

<label for="email">Email Address*</label>
<input type="email" id="email" required placeholder="Enter Your Email Address">

<label for="phone">Phone Number*</label>
<input type="tel" id="phone" required placeholder="Enter Your Phone Number">

<label for="address">Address*</label>
<textarea id="address" required rows="5" cols="80" placeholder="Enter Your Full Address with Pincode"></textarea>
`;


    // Specific fields for each category
    const fields = {
        "IAOI MEMBERS": `
    <label for="member_id">Member ID*</label>
    <input type="text" id="member_id" required placeholder="Enter Member ID" onblur="fetchMemberDetails()">
`,
        "AFFLIATE MEMBERS": `
    <label for="association_id">Association ID</label>
    <input type="text" id="association_id" required placeholder="Enter Association ID">
    <label for="association_name">Association Name</label>
    <input type="text" id="association_name" required placeholder="Enter Your Association Name">
`,
        "COMBO - NEW MEMBER + CONFERENCE": "",
        "GROUP REGISTRATIONS": `
    <label for="member_ids">Member IDs (press Enter to verify)</label>
    <input type="text" id="member_ids" required placeholder="Enter Member IDs" onkeypress="handleKeyPress(event)">
    <div id="verification_results"></div>
`,
        "INTERNATIONAL DELEGATES": ''
    };
    inputFields.innerHTML = (fields[category] + commonFields || "");
}
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        const memberIdInput = document.getElementById("member_ids");
        const memberId = memberIdInput.value.trim();
        if (memberId) {
            verifyMemberId(memberId);
            memberIdInput.value = ""; // Clear the input after verification
        }
    }
}

function verifyMemberId(memberId) {
    const resultsContainer = document.getElementById("verification_results");

    fetch(`https://dev.iaoi.in/api/v1/member/findMember/${memberId}`)
        .then(response => response.json())
        .then(data => {
            const tag = document.createElement("div");
            tag.className = "tag"; // Base class for the tag

            if (data.statusCode === 200 && data.result.length > 0) {
                const member = data.result[0];
                tag.classList.add("verified"); // Add verified class
                tag.innerHTML = `<strong>${memberId}</strong>: Verified - ${member.fullName} <span class="delete" onclick="removeTag(this)">X</span>`;
            } else {
                tag.classList.add("not-found"); // Add not found class
                tag.innerHTML = `<strong>${memberId}</strong>: Not a Member <span class="delete" onclick="removeTag(this)">X</span>`;
            }
            resultsContainer.appendChild(tag);
        })
        .catch(() => {
            const memberIdInput = document.getElementById("member_ids");
            memberIdInput.value = ""; // Clear the input
            memberIdInput.placeholder = "Error fetching details"; // Set placeholder to error message
            memberIdInput.classList.add("error"); // Add error class for styling
        });
}

function removeTag(tagElement) {
    const tag = tagElement.parentElement; // Get the parent tag div
    tag.remove(); // Remove the tag from the DOM
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
                document.getElementById("name").value = member.fullName || "";
                document.getElementById("email").value = member.email_id || "";
                document.getElementById("phone").value = member.mobile_no || "";
                document.getElementById("address").value = member.address || "";
                errorMessage.style.display = "none";
            } else {
                errorMessage.style.display = "block";
            }
        })
        .catch(() => errorMessage.style.display = "block");
}
document.addEventListener("DOMContentLoaded", function () {
    // Ensure step0 is shown initially
    document.getElementById("step0").style.display = "block";
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "none";
});

function handleMembershipChoice(choice) {
    document.getElementById("step0").style.display = "none";

    if (choice === "yes") {
        document.getElementById("step1").style.display = "block";
    } else {
        document.getElementById("step1").style.display = "block"; // For now, go to the same step
    }
}

function nextStep() {
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
        "GROUP REGISTRATIONS": [new Date("2025-05-30")]
    };

    if (category === "IAOI MEMBERS") {
        planAmount = todayTimestamp <= cutoffDates[category][0].getTime() ? 6500 :
            todayTimestamp <= cutoffDates[category][1].getTime() ? 7500 : 10000;
    } else if (category === "AFFLIATE MEMBERS") {
        planAmount = todayTimestamp <= cutoffDates[category][0].getTime() ? 8500 :
            todayTimestamp <= cutoffDates[category][1].getTime() ? 9000 : 9900;
    } else if (category === "COMBO - NEW MEMBER + CONFERENCE") {
        planAmount = todayTimestamp <= cutoffDates[category][0].getTime() ? 11000 : 0;
    }

    const gstAmount = planAmount * 0.18;
    const totalAmount = planAmount + gstAmount;

    document.getElementById("plan_amount").innerText = `₹ ${planAmount.toFixed(2)}`;
    document.getElementById("gst_amount").innerText = `₹ ${gstAmount.toFixed(2)}`;
    document.getElementById("total_amount").innerText = `₹ ${totalAmount.toFixed(2)}`;
}

function prevStep() {
    if (document.getElementById("step1").style.display === "block") {
        // If we are on step1, go back to step0
        document.getElementById("step1").style.display = "none";
        document.getElementById("step0").style.display = "block";
    } else if (document.getElementById("step2").style.display === "block") {
        // If we are on step2, go back to step1
        document.getElementById("step2").style.display = "none";
        document.getElementById("step1").style.display = "block";
    }
}
    

