document.addEventListener('template-bound', function() {
    var template = document.querySelector('#content');
    var lineChart = document.querySelector('chart-js');

    var bifrost = new Firebase('https://bifrost.firebaseio.com/last');
    var running_ref = bifrost.child('running');
    var sims_ref = bifrost.child('sims');
    var last_sim, sims;

    // Chek if a sim is running
    running_ref.on('value', function(data) {
        console.log('Simulation is running');
        sims_ref.once('value', function(data) {
            sims = data.val()
        });
        last_sim_id = data.val();
        last_sim = sims[last_sim_id];
    })

    for (proxy in last_sim.proxies) {
        // TODO create a chart
    }


    bifrost.child('last_sim_id').on('value', function(data) {
        last_sim_id = data.val();
        console.log(data.val());
        bifrost.child('sims/' + last_sim_id + '/0_0_0_0__3000').on('value', function(data) {
            var agg_r_vcpus = data.val().agg_r_vcpus;
            lineChart.addData([agg_r_vcpus * 100], data.val().snapshots.length);
        });
    });

    template.lineInitData = {
        datasets: [{
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
        }]
    };

    template.barInitData = {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [65, 59, 80, 81, 56, 55, 40]
        }, {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [28, 48, 40, 19, 86, 27, 90]
        }]
    };
});
