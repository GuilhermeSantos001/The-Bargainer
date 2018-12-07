/**
 * CONTROL OF PAGE
 */
if (!session.user)
    $(`#section_2`).hide(),
        $(`#section_3`).hide();
else
    $(`#section_1`).hide(),
        $(`#section_2`).hide();

$('#login').click(() => {
    $(`#section_1`).fadeOut(`slow`, () => {
        $(`#section_2`).fadeOut(`slow`, () => {
            $(`#section_1`).hide(`slow`, () => {
                $(`#section_2`).show(`slow`, () => {
                    $(`#section_2`).fadeIn(`slow`);
                });
            });
        });
    });
});

$(`#viewGameToken`).click(() => {
    if ($(`#inputgametoken`).attr('type') === 'password')
        $(`#inputgametoken`).attr('type', 'text');
    else
        $(`#inputgametoken`).attr('type', 'password');
});