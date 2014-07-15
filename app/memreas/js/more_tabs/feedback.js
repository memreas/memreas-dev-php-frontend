/**
 * Feedback for more tab handle here
 */
function submitFeedback(){
    var feedbackName = $("input[name=name_feedback]").val();
    var feedbackEmail = $("input[name=email_feedback]").val();
    var feedbackMessage = $("textarea[name=message_feedback]").val();

    if (feedbackName == '' || feedbackName == 'your name'){
        jerror("Please input your name");
        $("input[name=name_feedback]").focus();
        return false;
    }
    if (feedbackEmail == '' || feedbackEmail == 'your email'){
        jerror("Please input your email");
        $("input[name=email_feedback]").focus();
        return false;
    }
    if (feedbackMessage == ''){
        jerror("Please fill in your message");
        $("textarea[name=message_feedback]").focus();
        return false;
    }

    var params = [
                    {tag:'user_id', value: $("input[name=user_id]").val()},
                    {tag:'name', value: feedbackName},
                    {tag:'email', value: feedbackEmail},
                    {tag:'message', value: feedbackMessage}
                ];
    ajaxRequest('feedback', params, function(response){
        if (getValueFromXMLTag(response, 'status') == 'Success'){
            jsuccess(getValueFromXMLTag(response, 'message'));
            $("input[name=name_feedback]").val('your name');
            $("input[name=email_feedback]").val('your email');
            $("textarea[name=message_feedback]").val('');
        }
        else jerror(getValueFromXMLTag(response, 'message'));
    });
}