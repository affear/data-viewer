document.querySelector('#live-template').addEventListener('template-bound', function() {

    // HTML Elements
    var template = document.querySelector('#live-template');
    var sim_live = document.querySelector('#sim-live');
    var chart1 = document.querySelector('#chart1');
    var chart2 = document.querySelector('#chart2');
    var error_message = document.querySelector('#no-running-msg');

    // Firebase references
    var bifrost = new Firebase('https://bifrost.firebaseio.com');
    var running_ref = bifrost.child('running');
    var last_sim_id_ref = bifrost.child('last_sim_id');
    var sims_ref = bifrost.child('sims');

    // Template data-binding
    template.proxies = [];


    // Chek if a sim is running
    running_ref.on('value', function(data) {
        // Running
        if (data.val()) {
            sim_live.style.display = 'block';
            error_message.style.display = 'none';
            console.log('Simulation is running');
            _showLiveSim();
        }
        // Non Running
        else {
            sim_live.style.display = 'none';
            error_message.style.display = 'block';
            console.log('No simulation is running');
        }
    });


    var _showLiveSim = function() {

        last_sim_id_ref.once('value', function(data) {

            initLineCharts()

            var last_sim_id = data.val();

            var last_sim_ref = bifrost.child('sims/' + last_sim_id);
            var last_sim_proxies_ref = last_sim_ref.child('proxies');

            var proxy_counter = 0;

            // Update charts
            last_sim_proxies_ref.on('child_added', function(data) {
                var new_proxy = data.val();
                template.proxies.push(new_proxy);

                // Updating Sanpshots
                var snapshot_count = 0;
                new_proxy_snapshots_ref = last_sim_proxies_ref.child(proxy_counter + '/snapshots');
                new_proxy_snapshots_ref.on('child_added', function(data) {
                    var snapshot = data.val();
                    chart = document.querySelector('#addr' + new_proxy.address);

                    var avg_r_local_gb = snapshot.avg_r_local_gb * 1000;
                    var avg_r_memory_mb = snapshot.avg_r_memory_mb * 1000;
                    var avg_r_vcpus = snapshot.avg_r_vcpus * 1000;
                    var no_active_cmps = snapshot.no_active_cmps;

                    // Add data to the chart
                    chart1.addData([avg_r_local_gb, avg_r_memory_mb, avg_r_vcpus, no_active_cmps], last_snapshot_id);

                    snapshot_count++;
                });

                proxy_counter++;
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
});
