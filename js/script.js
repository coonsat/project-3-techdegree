

//when document loaded, set name be in focus
document.addEventListener("DOMContentLoaded", function() {

    const getDomElement = value => {
        return document.querySelector(value);
    };

    //Replaces the class of the element passed through according
    //to whether the element is valid or not. 
    const setValidity = (valid, element) => {
        element.className = valid ? "valid" : "not-valid";
    };

    //Method to set the element to visible or not. 
    //This can be confusing when interpreted from method calling point of view
    //If true is passed in, then show the element, if false then hide.
    //In most cases the element will show when the validity is false. 
    //So consider the method in isolation. 
    const setVisibility = (visible, element) => {
        if (visible) {
            element.style.display = "inline";
        } else {
            element.style.display = "none";
        }
    };

    //sets the visibility of the field set and adds any extra classes if needed
    const setFieldSetValidity = (valid, mainClass, element) => {
        element.className = valid ? mainClass + " valid" : mainClass + " not-valid";
    };

    const getParentElement = element => {
        return element.parentElement;
    }

    //Fetch all relevant information from a label tag and
    //return an object.
    const getCourseInfo = (courseName, timeFrame) => {
        let courseInfo = new Object();
        courseInfo.name = courseName;

        if (timeFrame !== null) {
            const day = timeFrame.substring( 0, timeFrame.indexOf(' ') );
            const start = timeFrame.substring( timeFrame.indexOf(' ') + 1, timeFrame.indexOf('-') );
            const end = timeFrame.substring( timeFrame.indexOf('-') + 1, timeFrame.length );

            //For day
            courseInfo.day = day;

            //For start time (convert to 24 hour time)
            if ( start.includes('pm') ) {
                courseInfo.start = parseInt(start.substring(0, start.length - 1)) + 12;
            } else {
                courseInfo.start = parseInt(start.substring(0, start.length - 1));
            }
    
            //For end time (convert to 24 hour time)
            if ( end.includes('pm') && !end.includes('12') ) {
                courseInfo.end = parseInt(end.substring(0, end.length - 1)) + 12;
            } else {
                courseInfo.end = parseInt(end.substring(0, end.length - 1));
            }

            return courseInfo;
        } else {
            return null;
        }
    };

    //Evaluate whether there is overlap between the schedules
    const checkForOverlap = (selectedActivity, comparisonActivity) => {
        //case 1: if start doesn't exist then there is no overlap
        if ( !selectedActivity.start ) return false;

        //case 2: if the days aren't the same then no overlap exists
        if ( selectedActivity.day !== comparisonActivity.day ) return false;

        //case 3: if unselected start GTE selected start AND unselected end LTE selected end
        if ( (comparisonActivity.start >= selectedActivity.start) && (comparisonActivity.end <= selectedActivity.end) ) return true;

        //case 4: if unselected start LTE selected start AND unselected end GTE selected start
        if ( (comparisonActivity.start <= selectedActivity.start) && (comparisonActivity.end >= selectedActivity.start) ) return true;

        //case 5: if unselected start GTE selected start AND unselected start LTE selected end
        if ( (comparisonActivity.start >= selectedActivity.start) && (comparisonActivity.start <= selectedActivity.end) ) return true;
        
        //case 6: if unselected start LTE selected start AND unselected end GTE selected end
        if ( (comparisonActivity.start <= selectedActivity.end) && (comparisonActivity.end >= selectedActivity.end) ) return true;
        return false;
    };

    //Treat the validation as an object that offers multiple functions
    //relating to the required validation.
    const validateForm = {

        name : function(name) {
            return /^\w{1,}$/.test(name);
        },

        //Code sourced from team treehours "Regular expressions in JavaScript"
        email : function(email) {
            return /[^@]+@[^\.]+\..+/.test(email);
        },

        cost : function(cost) {
            if ( cost === 0 ) return false;
            return true;
        },

        card : function(cardDetail, value) {
            switch(cardDetail) {
                case "cardNumber":
                    return /^\d{13,16}$/.test(value);

                case "zip":
                    return /^\d{5}$/.test(value);

                case "ccv":
                    return /^\d{3}$/.test(value);

                default:
                    return false;
            }
        }
    };

    //Set name input field as focus when DOM loaded
    const nameInput = getDomElement('#name');
    nameInput.focus();

    //Add event listener to email to assist user in creating
    //a properly formed email
    const emailInput = getDomElement('#email');
    const emailParent = getParentElement(emailInput);
    emailInput.addEventListener('input', function(event){
        const emailValid = validateForm.email(event.target.value);
        setValidity(emailValid, emailParent);
        setVisibility(!emailValid, emailParent.lastElementChild);
    })

    //Set up other job field to be hidden when
    //other job from drop down not selected
    const otherJobInput = getDomElement('.other-job-role');
    setVisibility(false, otherJobInput);

    const jobRoles = getDomElement('#title');
    jobRoles.addEventListener('change', function() {
        if (this.value === "other") {
            setVisibility(true, otherJobInput);
        } else {
            setVisibility(false, otherJobInput);
        }
    });

    //5.
    //Set up color to display drop down elements
    //that correspond to the design chosen
    //This is my own code however the following resource was used and adapted:
    //https://dev.to/isabelxklee/how-to-loop-through-an-htmlcollection-379k
    const colour = getDomElement('#color');
    colour.disabled = true;
    const design = getDomElement('#design');
    design.addEventListener('change', function() {
        if (this.value) {
            colour.disabled = false;
            //Set index to be the maximum length of selectable options
            let index = colour.options.length;
            Array.from(colour.options).forEach((option) => {
                if (option.dataset.theme === this.value) {
                    option.style.display = "inline";
                    //if index of option is less than index then
                    //overwrite this value to set the first field
                    index = option.index < index ? option.index : index;
                } else {
                    option.style.display = "none"
                }
                console.log(option)
            });
            //Set drop down selection to be the smallest index of the 
            //applicable fields
            colour.selectedIndex = index;
        } else {
            colour.disabled = true;
        }
    });

    //6.
    //Set up total to change according to
    //check boxes ticked
    //This is my own code however the following resource was used and adapted:
    //https://dev.to/isabelxklee/how-to-loop-through-an-htmlcollection-379k
    const activities = getDomElement('#activities');
    let cost = 0;
    activities.addEventListener('change', function(event) {
        let costDisplay = getDomElement('#activities-cost');
        costDisplay.textContent = "";
        cost = 0;
        const children = this.children.item(1).children;

        //Sums total price of selected activities
        Array.from(children).forEach(activity => {
            if (activity.children[0].checked) {
                cost += parseInt(activity.children[0].dataset.cost);
            }
        })
        costDisplay.textContent = "Total: $" + cost;

        //Checks for overlapping events
        //1. Get all courses that the user is attending / has checked
        let attendingCourses = [];
        Array.from(children).forEach(activity => {
            if (activity.children[0].checked) {
                const courseInfo = getCourseInfo(activity.children[1].textContent, activity.children[2].textContent);
                attendingCourses.push(courseInfo);
            }
        });

        //2. Compare all activities against those that are checked
        Array.from(children).forEach(activity => {
            // if courses have been checked then check for overlaps
            // if no courses have been checked then enable all fields
            if (attendingCourses.length > 0 ) {
                const courseInfo = getCourseInfo(activity.children[1].textContent, activity.children[2].textContent);
                let overlap = false;

                // iterate over attending courses. Ignore the identical object 
                // If overlap found then break loop (no need to evaluate 
                // further cases in outer loop)
                for (let i = 0 ; i < attendingCourses.length ; i++) {
                    if (attendingCourses[i].name !== courseInfo.name) {
                        overlap = checkForOverlap(attendingCourses[i], courseInfo);
                        if (overlap) break; 
                    }
                }

                // Disable activity if overlap is found
                if (overlap) {
                    activity.children[0].disabled = true;
                    activity.className = 'disabled';
                } else {
                    activity.children[0].disabled = false;
                    activity.className = '';
                }

            } else {
                activity.children[0].disabled = false;
            }
        });
    });

    //9. Accessibility for input elements via tab button
    //add two event listeners to the parent class of the selected
    //input item. The classes will be overwritten each time. 
    const children = activities.children.item(1).children;
    Array.from(children).forEach(label => {
        inputElement = label.children[0];

        inputElement.addEventListener('focus', function() {
            label.className = "focus";
        });

        inputElement.addEventListener('blur', function() {
            label.className = "blur";
        });
    });

    //7.
    //Set up credit card payment section
    //First set the default to credit-card
    //Then add an event listener to the payment select tag
    const payment = getDomElement('#payment');
    Array.from(payment.options).forEach(option => {
        if (option.value === "credit-card") {
            option.selected = true;
        } else {
            let element = getDomElement('#' + option.value);
            // if (element) element.style.display = "none";
            if (element) setVisibility(false, element);
        }
    });
    //Iterate through payment options to find which is the selected option. 
    //If the option.value matches the selected value then set the view to visible.
    //If not then hide the view
    payment.addEventListener('change', function() {
        Array.from(payment.options).forEach(option => {
            if (option.value === this.value) {
                let selected = getDomElement('#' + this.value);
                selected.style.display = "block";
            } else {
                let nonSelected = getDomElement('#' + option.value);
                if (nonSelected) setVisibility(false, nonSelected);
            }
        });
    });

    //8.
    //Validation of data after submit button pressed
    const submitButton = document.getElementsByTagName('button')[0];
    submitButton.addEventListener('click', function(event) {
        
        let valid = true;
        
        //Name
        const name = getDomElement('#name');
        const nameLabel = name.parentElement;
        if ( !validateForm.name(name.value) ) {
            setValidity(false, nameLabel);
            setVisibility(true, nameLabel.lastElementChild);
            valid = false;
        } else {
            setValidity(true, nameLabel);
            setVisibility(false, nameLabel.lastElementChild);
        }

        //Email
        const email = getDomElement('#email');
        const emailLabel = email.parentElement;
        if ( !validateForm.email(email.value) ) {
            setValidity(false, email.parentElement);
            setVisibility(true, emailLabel.lastElementChild);
            valid = false;
        } else {
            setValidity(true, email.parentElement);
            setVisibility(false, emailLabel.lastElementChild);
        }

        //Check if activities have been chosen
        const costFieldSet = getDomElement('#activities');
        const costElement = getDomElement('#activities-cost');
        const costString = costElement.textContent;
        const totalCost = costString.substring( costString.indexOf('$') + 1 );
        if ( !validateForm.cost( parseInt(totalCost) ) ) {
            setFieldSetValidity(false, 'activities', costFieldSet);
            valid = false;
        } else {
            setFieldSetValidity(true, 'activities', costFieldSet);
        }

        //Check details of card number used for payment
        const paymentFieldSet = getDomElement('.payment-methods');
        const paymentType = getDomElement('#payment').value;

        if (paymentType === 'credit-card') {
            let paymentValid = true;
            const cardNumber = getDomElement('#cc-num');
            const cardNumberParent = getParentElement(cardNumber);
            if ( !validateForm.card('cardNumber', cardNumber.value) ) {
                setValidity(false, cardNumberParent);
                setVisibility(true, cardNumberParent.lastElementChild);
                paymentValid = false;
            } else {
                setValidity(true, cardNumberParent);
                setVisibility(false, cardNumberParent.lastElementChild);
            }

            //Check details of zip used for payment
            const zip = getDomElement('#zip');
            const zipParent = getParentElement(zip);
            if ( !validateForm.card('zip', zip.value) ) {
                setValidity(false, zipParent);
                setVisibility(true, zipParent.lastElementChild);
                paymentValid = false;
            } else {
                setValidity(true, zipParent);
                setVisibility(false, zipParent.lastElementChild);
            }

            //Check details of ccv used for payment
            const ccv = getDomElement('#' + 'cvv');
            const ccvParent = getParentElement(ccv);
            if ( !validateForm.card('ccv', ccv.value) ) {
                // 
                setValidity(false, ccvParent);
                setVisibility(true, ccvParent.lastElementChild);
                paymentValid = false;
            } else {
                setValidity(true, ccvParent);
                setVisibility(false, ccvParent.lastElementChild);
            }

            if ( !paymentValid ) {
                setFieldSetValidity(false, 'payment-methods', paymentFieldSet);
                valid = false;
            } else {
                setFieldSetValidity(true, 'payment-methods', paymentFieldSet);
            }

        }

        if ( !valid ) {
            event.preventDefault();
        } else {
            setFieldSetValidity(true, 'payment-methods', paymentFieldSet);
        }
        
    });

})
