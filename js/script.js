(function(window, document, undefined) {

    // pane elements
    var rightPane = document.getElementById('right-pane');
    var leftPane = document.getElementById('left-pane');

    // button and input elements
    // TODO: add button/input element selectors here

    // script elements that correspond to Handlebars templates
    var questionFormTemplate = document.getElementById('question-form-template');
    var questionListTemplate = document.getElementById('questions-template');
    var expandedQuestionTemplate = document.getElementById('expanded-question-template');

    // compiled Handlebars templates
    var templates = {
        renderQuestionForm: Handlebars.compile(questionFormTemplate.innerHTML),
        renderQuestionList: Handlebars.compile(questionListTemplate.innerHTML),
        renderExpandedQuestion: Handlebars.compile(expandedQuestionTemplate.innerHTML)
    };

    /* Returns the questions stored in localStorage. */
    function getStoredQuestions() {
        if (!localStorage.questions) {
            // default to empty array
            localStorage.questions = JSON.stringify([]);
        }

        return JSON.parse(localStorage.questions);
    }

    /* Store the given questions array in localStorage.
     *
     * Arguments:
     * questions -- the questions array to store in localStorage
     */
    function storeQuestions(questions) {
        localStorage.questions = JSON.stringify(questions);
    }

    // TODO: tasks 1-5 and one extension
    function checkError(elem,type){
        if(elem.parentElement.querySelector("."+elem.tagName)){
            elem.parentElement.removeChild(elem.parentElement.querySelector("."+elem.tagName));
        }

        var error = document.createElement("span");
        error.classList.add(elem.tagName);
        error.classList.add("error-message");
        if(elem.value == ""){
            error.innerHTML = "Text field must have content."
            elem.parentElement.insertBefore(error,elem);
            return true;
        }
        if(type == "response-response" || type == "question-question"){
            if(elem.value.length > 500){
                error.innerHTML = "Field must not be more than 500 characters.";
                elem.parentElement.insertBefore(error,elem);
                return true;
            }else if(elem.value.length < 50){
                error.innerHTML = "Field must be more than 50 characters.";
                elem.parentElement.insertBefore(error,elem);
                return true;
            }
        }
        if(type == "response-name"){
            if(elem.value.indexOf(' ') == -1 || elem.value.indexOf(' ') >= elem.value.length - 1){
                error.innerHTML = "Name field must include first and last name, separated by a space.";
                elem.parentElement.insertBefore(error,elem);
                return true;
            }
        }
        return false;
    }

    function updateQuestionList(){
        leftPane.innerHTML = templates.renderQuestionList({
            questions : getStoredQuestions()
        });

        leftPane.addEventListener("click",onQuestionSelect);
    }

    function showExpandedQuestion(question){
        rightPane.innerHTML = templates.renderExpandedQuestion(
            getStoredQuestions().filter(function(q){
                return q.id == question.id;
            })[0]
        )

        document.getElementById("response-form").addEventListener("submit",function(e){
            onResponseFormSubmission(e,question); //call the event handler with the question specified.
        });

        rightPane.querySelector(".resolve.btn").addEventListener("click",function(e){
            onResolveClick(e,question);
        })
    }

    function onResolveClick(event,question){
        storeQuestions(getStoredQuestions().filter(function(q){
            return q.id != question.id;
        }));

        updateQuestionList();
        rightPane.innerHTML = templates.renderQuestionForm();
        handleQuestionSubmission();
    }

    function onResponseFormSubmission(event,question){
        event.preventDefault();

        var formName = event.target.querySelector("input[name=name]");
        var formResponse = event.target.querySelector("textarea[name=response]");

        if(checkError(formName,'response-name')) return;
        if(checkError(formResponse,'response-response')) return;

        var questions = getStoredQuestions();
        questions.filter(function(q){
            return q.id == question.id; //refers to question currently displayed
        })[0].responses.push({
            name : formName.value,
            response : formResponse.value
        });
        storeQuestions(questions);

        formName.value = "";
        formResponse.value = "";

        showExpandedQuestion(question);
    }

    function onQuestionSelect(event){
        var question = event.target;
        if(question.classList.contains("question-info")){
            showExpandedQuestion(question);
        }else{
            question.parentElement.click(); //Propagate up the DOM
        }
    }

    function handleQuestionSubmission(){
        document.getElementById("question-form").addEventListener("submit",function(event){
            event.preventDefault();

            var formSubject = event.target.querySelector("input[name=subject]");
            var formQuestion = event.target.querySelector("textarea[name=question]");
            
            if(checkError(formSubject,'question-subject')) return;
            if(checkError(formQuestion,'question-question')) return;
            
            var questions = getStoredQuestions()
            questions.unshift({
                id : Math.floor(Math.random()*10000000),
                subject : formSubject.value,
                question : formQuestion.value,
                responses : []
            });
            storeQuestions(questions);
            
            formSubject.value = "";
            formQuestion.value = "";

            updateQuestionList();
        });
    }

    function handleQuestionFormButton(){
        document.querySelector("#interactors .btn").addEventListener("click",function(event){
            rightPane.innerHTML = templates.renderQuestionForm();
            handleQuestionSubmission();
        });
    }

    // display question form initially
    rightPane.innerHTML = templates.renderQuestionForm();
    updateQuestionList();

    handleQuestionFormButton();
    handleQuestionSubmission();


})(this, this.document);
