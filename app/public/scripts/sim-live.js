document.querySelector('#live-template').addEventListener('template-bound', function() {
    var template = document.querySelector('#live-template');
    var simLive = document.querySelector('#sim-live');
    var chart1 = document.querySelector('#chart1');
    var chart2 = document.querySelector('#chart2');
    var errorMessage = document.querySelector('#no-running-msg');

    var bifrost = new Firebase('https://bifrost.firebaseio.com');
    var running_ref = bifrost.child('running');
    var last_sim_id_ref = bifrost.child('last_sim_id');
    var sims_ref = bifrost.child('sims');
    var last_sim, sims;

    // Chek if a sim is running
    running_ref.on('value', function(data) {
        // Running
        if (data.val()) {
            simLive.style.display = 'block';
            errorMessage.style.display = 'none';
            console.log('Simulation is running');
            _showLiveSim();
        }
        // Non Running
        else {
            simLive.style.display = 'none';
            errorMessage.style.display = 'block';
            console.log('No simulation is running');
        }
    })

    var _showLiveSim = function() {

        last_sim_id_ref.once('value', function(data) {

            initLineCharts()

            var last_sim_id = data.val();

            var last_sim_ref = bifrost.child('sims/' + last_sim_id);
            var last_sim_proxies_ref = last_sim_ref.child('proxies');

            // TODO Change to array of proxies
            // Update charts
            last_sim_proxies_ref.child('0_0_0_0__3000/snapshots').on('child_added', function(data) {
                var snapshot = data.val();
                chart1 = document.querySelector('#chart1');
                chart1.addData([snapshot.avg_r_local_gb * 1000, snapshot.avg_r_memory_mb * 1000, snapshot.avg_r_vcpus * 1000, snapshot.no_active_cmps], "ok");
            });
        });
    }

    var initLineCharts = function() {
        template.lineChart1InitData = {
            datasets: [{
                label: "avg_r_local_gb",
                fillColor: "rgba(244, 67, 54, 0.2)",
                strokeColor: "rgba(244, 67, 54, 1)",
                pointColor: "rgba(244, 67, 54, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(244, 67, 54, 1)",
            }, {
                label: "avg_r_memory_mb",
                fillColor: "rgba(62, 83, 175, 0.2)",
                strokeColor: "rgba(62, 83, 175, 1)",
                pointColor: "rgba(62, 83, 175, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(62, 83, 175, 1)",
            }, {
                label: "avg_r_vcpus",
                fillColor: "rgba(65, 174, 93, 0.2)",
                strokeColor: "rgba(65, 174, 93, 1)",
                pointColor: "rgba(65, 174, 93, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(65, 174, 93, 1)",
            }, {
                label: "cmps",
                fillColor: "rgba(255, 191, 66, 0.2)",
                strokeColor: "rgba(255, 191, 66, 1)",
                pointColor: "rgba(255, 191, 66, 1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(255, 191, 66, 1)",
            }, ]
        };
    }

    // template.barInitData = {
    //     labels: ["January", "February", "March", "April", "May", "June", "July"],
    //     datasets: [{
    //         label: "My First dataset",
    //         fillColor: "rgba(220,220,220,0.2)",
    //         strokeColor: "rgba(220,220,220,1)",
    //         pointColor: "rgba(220,220,220,1)",
    //         pointStrokeColor: "#fff",
    //         pointHighlightFill: "#fff",
    //         pointHighlightStroke: "rgba(220,220,220,1)",
    //         data: [65, 59, 80, 81, 56, 55, 40]
    //     }, {
    //         label: "My Second dataset",
    //         fillColor: "rgba(151,187,205,0.2)",
    //         strokeColor: "rgba(151,187,205,1)",
    //         pointColor: "rgba(151,187,205,1)",
    //         pointStrokeColor: "#fff",
    //         pointHighlightFill: "#fff",
    //         pointHighlightStroke: "rgba(151,187,205,1)",
    //         data: [28, 48, 40, 19, 86, 27, 90]
    //     }]
    // };
});