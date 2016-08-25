$(document).ready(function(){
    $('#form1').submit(function(event){
        event.preventDefault();
        $.ajax({
            url: '/api/signup',
            type: 'POST',
            data: $('#form1').serialize()
        }).done(function(result){
            $('#msgcolor').removeClass('alert-danger');
            $('#msgcolor').addClass('alert-success');
            $("#message").html('Done! '+result.message);
            $('#msgcolor').show();
            setTimeout(function(){window.location.href = '/'},3000);
        }).fail(function(err){
            $('#msgcolor').removeClass('alert-success');
            $('#msgcolor').addClass('alert-danger');
            $("#message").html('Error! '+err.responseJSON.message);
            $('#msgcolor').show();
        });
    });

    $('#form2').submit(function(event){
        event.preventDefault();
        $.ajax({
            url: '/api/login',
            type: 'POST',
            data: $('#form2').serialize()
        }).fail(function(err){
            $('#msgcolor').removeClass('alert-success');
            $('#msgcolor').addClass('alert-danger');
            $('#message').html('Error! '+(err.responseText || err));
            $('#msgcolor').show();
        }).done(function(){
            window.location.href= '/profile';
        });
    });

    $('#form3').submit(function(event){
        event.preventDefault();
        $.ajax({
            url: '/controlpanel/users/edit',
            type: 'POST',
            data: $('#form3').serialize(),
        }).done(function(result){
            $('#msgcolor').removeClass('alert-danger');
            $('#msgcolor').addClass('alert-success');
            $("#message").html('Done! '+result.message);
            $('#msgcolor').show();
             window.location.href= '/profile';
        }).fail(function(err){
            $('#msgcolor').removeClass('alert-success');
            $('#msgcolor').addClass('alert-danger');
            $("#message").html('Error! '+err.responseJSON.message);
            $('#msgcolor').show();
        });
    });

    $('#form4').submit(function(event){
        event.preventDefault();
        $.ajax({
            url: '/api/changerole',
            type: 'POST',
            data: $('#form4').serialize()
        }).done(function(result){
            window.location.href= '/admin';
        }).fail(function(err){
            console.log(err);
        });
    });

    $('#form5').submit(function(event){
        event.preventDefault();
        $.ajax({
            url: '/api/logout',
            type: 'GET'
        }).done(function(){
            window.location.href= '/';
        });
    });

    

});
